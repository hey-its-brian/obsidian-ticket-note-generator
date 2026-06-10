# New Ticket

An Obsidian plugin that creates a ticket folder with a pre-filled note and a code scratchpad from a sidebar button.

Ported from `obsidian_new_ticket.sh`.

NOTE: This is a pretty specific plugin with my exact needs in mind, but if you're reading this and need something similar, have at it.

## What it creates

For ticket `ABC-123` with the default settings:

```
Tickets/
└── ABC-123/
    ├── ABC-123.md       # frontmatter + status tag + link to code file
    └── ABC-123-code.rb  # header comments + blank scratchpad
```

The note is generated with this frontmatter:

```yaml
---
application:
  - EnrollApp
type: ticket
ticket_number: ABC-123
ticket_url: https://dchbx.atlassian.net/browse/ABC-123
ticket_subject:

start: <today>
---

#status/in-progress
[[ABC-123-code.rb]]
```

After creation the note opens in the active pane.

## Usage

- **Ribbon icon** (left sidebar): click the ticket icon, type the ticket number, press Enter.
- **Command palette**: "New Ticket: Create new ticket".

If the ticket folder already exists, the plugin aborts with a notice — it will not overwrite anything.

## Resolving a ticket

With any file from a ticket folder open:

- **Ribbon icon** (left sidebar): click the check-circle icon, or
- **Command palette**: "New Ticket: Resolve current ticket".

This swaps the in-progress tag (Tag 1) for the resolved tag in every `.md` file in the ticket folder, then moves the whole folder into the resolved folder (default `Tickets/Resolved/ABC-123`). Links are updated by Obsidian's file manager. If a folder with the same name already exists under Resolved, the move is aborted with a notice.

## Settings

**Settings → Community plugins → New Ticket**

| Setting | Default | Description |
| --- | --- | --- |
| Tickets folder | `Tickets` | Vault-relative folder where ticket folders are created. Nested paths like `Work/Tickets` are fine; missing parents are created. |
| Add tags to note | on | When on, writes tags on their own lines after the frontmatter (not inside it). When off, no tags are written. |
| Tag 1 | `#status/in-progress` | Primary tag. Shown only when "Add tags to note" is on. Leading `#` is optional — added automatically if missing. |
| Tag 2 (optional) | empty | Second tag. Skipped if blank. |
| Tag 3 (optional) | empty | Third tag. Skipped if blank. |
| Resolved folder | `Resolved` | Subfolder of the tickets folder where resolved tickets are moved. |
| Resolved tag | `#status/resolved` | Tag that replaces Tag 1 in the ticket's `.md` files when resolving. |

The Jira base URL (`https://dchbx.atlassian.net/browse`) and the `EnrollApp` application tag are currently hardcoded in `main.js`.

## Install (local / development)

This plugin is plain JavaScript — no build step.

Symlink the repo into your vault's plugins folder:

```sh
ln -s ~/development/obsidian-dev/obsidian-ticket-note-generator \
      ~/obsidian_hbx/DCHBX/.obsidian/plugins/new-ticket
```

Or copy it:

```sh
cp -r ~/development/obsidian-dev/obsidian-ticket-note-generator \
      ~/obsidian_hbx/DCHBX/.obsidian/plugins/new-ticket
```

Then in Obsidian:

1. **Settings → Community plugins** — disable Restricted Mode if needed.
2. Enable **New Ticket**.

After editing `main.js`, reload the plugin (toggle it off/on) or run "Reload app without saving" from the command palette.

## Files

- `manifest.json` — plugin metadata.
- `main.js` — plugin source (ribbon, modal, settings tab, file creation).

## License

See [LICENSE](LICENSE).
