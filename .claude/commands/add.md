---
description: "Read docs/cli"
---

# add

Read docs/cli.md for allowed fields and resolve foreign keys from current reads. Add only factual operator input, then read back the new record.

Run:

```bash
npm run fundraising -- add <entity> <json-fields> --json
```

Read fresh records. Preserve currency and source references. Do not invent data, payments, receipts or sends. This recipe never sends, publishes or processes money. Present the result in plain language and name unresolved exceptions.
