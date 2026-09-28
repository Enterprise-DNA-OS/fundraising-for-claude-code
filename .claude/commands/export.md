---
description: "Export the full base record set, audit and import provenance into a new file"
---

# export

Export the full base record set, audit and import provenance into a new file. Protect donor data. This does not replace tested database backups.

Run:

```bash
npm run fundraising -- export <new-file.json> --json
```

Read fresh records. Preserve currency and source references. Do not invent data, payments, receipts or sends. This recipe never sends, publishes or processes money. Present the result in plain language and name unresolved exceptions.
