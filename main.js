const { Plugin, PluginSettingTab, Setting, Modal, Notice, normalizePath } = require('obsidian');

const DEFAULT_SETTINGS = {
  ticketsFolder: 'Tickets',
};

const BASE_URL = 'https://dchbx.atlassian.net/browse';

class NewTicketPlugin extends Plugin {
  async onload() {
    await this.loadSettings();

    this.addRibbonIcon('ticket', 'New ticket', () => {
      new TicketModal(this.app, this).open();
    });

    this.addCommand({
      id: 'create-new-ticket',
      name: 'Create new ticket',
      callback: () => new TicketModal(this.app, this).open(),
    });

    this.addSettingTab(new NewTicketSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async ensureFolder(path) {
    const parts = path.split('/').filter((p) => p.length > 0);
    let current = '';
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (!(await this.app.vault.adapter.exists(current))) {
        await this.app.vault.createFolder(current);
      }
    }
  }

  async createTicket(rawTicket) {
    const ticket = (rawTicket || '').trim();
    if (!ticket) {
      new Notice('No ticket number provided.');
      return;
    }

    const baseFolder = (this.settings.ticketsFolder || DEFAULT_SETTINGS.ticketsFolder).trim();
    const ticketFolder = normalizePath(`${baseFolder}/${ticket}`);
    const notePath = `${ticketFolder}/${ticket}.md`;
    const codePath = `${ticketFolder}/${ticket}-code.rb`;

    if (await this.app.vault.adapter.exists(ticketFolder)) {
      new Notice(`Ticket folder already exists: ${ticketFolder}`);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    const noteContent = `---
application:
  - EnrollApp
type: ticket
ticket_number: ${ticket}
ticket_url: ${BASE_URL}/${ticket}
ticket_subject:

start: ${today}
---

#status/in-progress
[[${ticket}-code.rb]]
`;

    const codeContent = `# ${ticket}
# ${BASE_URL}/${ticket}
# Created: ${today}


`;

    try {
      await this.ensureFolder(ticketFolder);
      const noteFile = await this.app.vault.create(notePath, noteContent);
      await this.app.vault.create(codePath, codeContent);
      new Notice(`Created ticket: ${ticket}`);
      await this.app.workspace.getLeaf(false).openFile(noteFile);
    } catch (err) {
      console.error('New Ticket plugin failed to create ticket', err);
      new Notice(`Failed to create ticket: ${err.message || err}`);
    }
  }
}

class TicketModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: 'New ticket' });

    const label = contentEl.createEl('label', { text: 'Ticket number' });
    label.style.display = 'block';
    label.style.marginBottom = '0.25em';

    const input = contentEl.createEl('input', { type: 'text' });
    input.placeholder = 'e.g. ABC-123';
    input.style.width = '100%';
    input.style.marginBottom = '1em';

    const buttonRow = contentEl.createDiv();
    buttonRow.style.display = 'flex';
    buttonRow.style.justifyContent = 'flex-end';
    buttonRow.style.gap = '0.5em';

    const cancelBtn = buttonRow.createEl('button', { text: 'Cancel' });
    cancelBtn.onclick = () => this.close();

    const submitBtn = buttonRow.createEl('button', { text: 'Create' });
    submitBtn.classList.add('mod-cta');

    const submit = async () => {
      const value = input.value;
      this.close();
      await this.plugin.createTicket(value);
    };

    submitBtn.onclick = submit;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      }
    });

    window.setTimeout(() => input.focus(), 0);
  }

  onClose() {
    this.contentEl.empty();
  }
}

class NewTicketSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Tickets folder')
      .setDesc('Vault-relative folder where ticket folders will be created.')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.ticketsFolder)
          .setValue(this.plugin.settings.ticketsFolder)
          .onChange(async (value) => {
            this.plugin.settings.ticketsFolder = value.trim() || DEFAULT_SETTINGS.ticketsFolder;
            await this.plugin.saveSettings();
          }),
      );
  }
}

module.exports = NewTicketPlugin;
