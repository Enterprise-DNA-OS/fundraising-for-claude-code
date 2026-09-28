# Fundraising CLI

Node 20 or later. All commands accept --json. Human output is the default. Names match case-insensitively, exact names first, then partial names or ID prefixes. Ambiguity lists candidates and exits 1. Shell-quote names and JSON as one argument. Use ISO dates and decimal amounts without currency symbols or thousands separators.

| Command | Arguments | Work |
|---|---|---|
| organisations | None | List receiving charities and identity verification flags. |
| constituents | None | List donors and suppression flags. |
| gifts | None | Read recorded gifts, dates, amounts, evidence and void status. |
| campaigns | None | Compare received cash, outstanding promises and the gap to each campaign goal. |
| funds | None | Review purposes and restrictions. |
| appeals | None | Compare cash receipts and appeal costs within each currency. |
| pledges | None | Read promises and remaining balances. |
| pledges-due | None | Review overdue promises and those due in the next 30 days. Use the recorded balance, not the original promise. |
| call-cycle | None | Review actions due this week. Include blocked and unknown permission in the report, but do not contact those donors. |
| attention | None | Find donors with overdue actions or gifts older than 365 days. |
| lapsed-donors | None | Read the lapsed donor list, excluding deceased and globally suppressed donors. Channel permission still needs checking. |
| thank-you-queue | None | List unacknowledged gifts with email permission status. Do not infer that a message was sent. |
| fund-balances | None | Report money received into each fund. These are receipt totals, not available balances after spending. |
| receipt-review | None | Read docs/compliance.md. Report receipt blockers with the record reference. Do not claim that a clear record is a legally issued receipt. |
| compliance | None | Read docs/compliance.md. Separate statutory receipt fields from internal contact and restriction policies. Summarise every exception. |
| actions | None | Review due dates and actual completion dates. |
| relationships | None | Show donor connections and relationship types. |
| preferences | None | Read channel status and its supporting evidence. |
| audit | None | Read the local change history. |
| giving-summary | None | Summarise received cash by donor and currency, excluding void and in-kind gifts. |
| donor | <name-or-id> | Read the donor, gifts, promises, actions and relationships. If ambiguous, show the candidates and stop. |
| weekly-review | None | Combine pledges-due, call-cycle and thank-you-queue. Write the Monday priorities: promise, owner, date, contact permission and next action. Never combine currencies. |
| add | <entity> <json-fields> | Read docs/cli.md for allowed fields and resolve foreign keys from current reads. Add only factual operator input, then read back the new record. |
| log | <donor> <summary> <YYYY-MM-DD> <channel> [owner] [notes] | Create the next action in the donor history. This does not record a message as sent or a promise as paid. |
| complete-action | <action> <YYYY-MM-DD> <outcome> | Record actual work and its outcome. Do not complete a task based on a drafted message. |
| preference | <donor> <channel> <allowed / blocked / unknown> <evidence> <YYYY-MM-DD> | Record a verified preference with source evidence. Never infer permission from a gift or an email address. |
| suppress | <donor> <reason> | Record a requested global contact suppression and retain the reason. |
| acknowledge | <gift> <YYYY-MM-DD> <evidence> | Record acknowledgement actually performed outside this system. It does not issue a tax receipt. |
| void-gift | <gift> <reason> | Read the gift and pledge first. Mark a mistaken record void with the documented reason. This never sends a refund or deletes history. |
| draft-thanks | <gift> | Draft an email acknowledgement only when the email preference allows it. Open the file in drafts/ and review it. Never send. |
| draft-pledge | <pledge> [phone / email / post / meeting] | Read the pledge balance and preference. Draft the conversation in drafts/. Never send or charge. |
| draft-receipt | <gift> | Read docs/compliance.md. Run receipt-review first. The result in drafts/ is explicitly not valid for tax claims. The operator verifies identity, letterhead, numbering and signature before any issuance elsewhere. |
| import | raisers-edge <folder> <organisation> [--apply] | Read docs/replace-raisers-edge.md. Preview without --apply, reconcile the counts and separate currency/type totals, then apply the same bundle on instruction. |
| export | <new-file.json> | Export the full base record set, audit and import provenance into a new file. Protect donor data. This does not replace tested database backups. |
| help | None | List the CLI commands and open docs/cli.md for arguments. |

## Adding records

The add command accepts one JSON object with actual field values. It never updates existing records. Resolve foreign IDs with the corresponding read command first. Allowed entities and fields are listed in scripts/lib/domain.mjs, which rejects unrecognised or protected fields. organisations, constituents, campaigns, funds, appeals, pledges, gifts, actions and relationships can be added. An organisation starts unverified unless an operator explicitly records verification. To change an existing identity or workflow, use /customise and preserve an audit record.

Example against the demo:

```bash
npm run fundraising -- log "Aroha Williams" "Review book delivery" 2026-10-01 meeting Mere
npm run fundraising -- donor "Aroha Williams" --json
npm run fundraising -- import raisers-edge fixtures/raisers-edge "Harbour Literacy Trust NZ"
```

Gift names are unique transaction references. Amounts use two-decimal database arithmetic. A linked gift must match its pledge's donor, campaign and currency and cannot exceed its remaining balance. Gift currency must also match the receiving organisation. Void preserves the original record and audit and removes it from totals. No refund is executed.

Preferences accept phone, email, post or meeting and allowed, blocked or unknown, with dated evidence. Suppression takes precedence. Imported email addresses carry no inferred permission. Final receipts, payment processing, return filing and statutory accounts stay outside this base. See docs/compliance.md.

PGlite is one local process at a time. The Postgres adapter uses one client per invocation; shared operation needs scoped credentials and a deployment access policy. Export uses a consistent read transaction and refuses to overwrite an existing file. Generated HTML and drafts contain donor information; treat them as private working files.
