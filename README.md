# Fundraising for Claude Code

Donors, gifts, pledges, appeals and stewardship in a database you own. Built for NZ and Australian charities. MIT licensed. Works with Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Run the demo and map your exports. | Your fields, rules, donor history and screens. | Installed, connected and operated through Omni by Enterprise DNA. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=raisers-edge&utm_source=github&utm_medium=customise) | [Book Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=raisers-edge&utm_source=github&utm_medium=managed) |

Custom installation: a setup fee, then a retainer. Hosting and agent usage have their own costs.

## The weekly work

Review overdue pledges, plan donor calls, acknowledge gifts, report campaign progress and prepare trustee paperwork. Contact preferences travel with the donor. Cash, in-kind gifts and unpaid pledges remain separate. Currency never disappears from a total. Payment processing stays with your provider.

Blackbaud's [pricing page](https://www.blackbaud.com/pricing), checked 28 September 2026, asks for an organisation-specific quote and publishes no Raiser’s Edge NXT amount. Compare your actual renewal quote to the workflows you use. This is an owned donor operations base, not full NXT parity.

## Quick start

Node 20 or later, on Windows or Linux:

```bash
git clone https://github.com/Enterprise-DNA-OS/fundraising-for-claude-code.git
cd fundraising-for-claude-code
npm install
npm run demo
npm test
npm run view
npm run docs
```

Open the folder in your agent. Ask which pledges need attention this week. Harbour Literacy Trust is fictional. Its dates are relative to the first seed. Re-seeding does not reset changes. Its organisation tax identifiers are fake and receipt eligibility starts unverified.

PGlite stores the local database in .data/db, or DATA_DIR. DATABASE_URL selects hosted Postgres. For real donor data start with a fresh database, run migrate, then import without seeding. Configure scoped access, verified TLS, private storage and tested backups before sharing. One local PGlite process at a time.

## Commands

35 CLI commands and 37 slash recipes. Each CLI command supports --json. [Arguments and behaviours](docs/cli.md).

- /organisations: List receiving charities and identity verification flags.
- /constituents: List donors and suppression flags.
- /gifts: Read recorded gifts, dates, amounts, evidence and void status.
- /campaigns: Compare received cash, outstanding promises and the gap to each campaign goal.
- /funds: Review purposes and restrictions.
- /appeals: Compare cash receipts and appeal costs within each currency.
- /pledges: Read promises and remaining balances.
- /pledges-due: Review overdue promises and those due in the next 30 days. Use the recorded balance, not the original promise.
- /call-cycle: Review actions due this week. Include blocked and unknown permission in the report, but do not contact those donors.
- /attention: Find donors with overdue actions or gifts older than 365 days.
- /lapsed-donors: Read the lapsed donor list, excluding deceased and globally suppressed donors. Channel permission still needs checking.
- /thank-you-queue: List unacknowledged gifts with email permission status. Do not infer that a message was sent.
- /fund-balances: Report money received into each fund. These are receipt totals, not available balances after spending.
- /receipt-review: Read docs/compliance.md. Report receipt blockers with the record reference. Do not claim that a clear record is a legally issued receipt.
- /compliance: Read docs/compliance.md. Separate statutory receipt fields from internal contact and restriction policies. Summarise every exception.
- /actions: Review due dates and actual completion dates.
- /relationships: Show donor connections and relationship types.
- /preferences: Read channel status and its supporting evidence.
- /audit: Read the local change history.
- /giving-summary: Summarise received cash by donor and currency, excluding void and in-kind gifts.
- /donor: Read the donor, gifts, promises, actions and relationships. If ambiguous, show the candidates and stop.
- /weekly-review: Combine pledges-due, call-cycle and thank-you-queue. Write the Monday priorities: promise, owner, date, contact permission and next action. Never combine currencies.
- /add: Read docs/cli.md for allowed fields and resolve foreign keys from current reads. Add only factual operator input, then read back the new record.
- /log: Create the next action in the donor history. This does not record a message as sent or a promise as paid.
- /complete-action: Record actual work and its outcome. Do not complete a task based on a drafted message.
- /preference: Record a verified preference with source evidence. Never infer permission from a gift or an email address.
- /suppress: Record a requested global contact suppression and retain the reason.
- /acknowledge: Record acknowledgement actually performed outside this system. It does not issue a tax receipt.
- /void-gift: Read the gift and pledge first. Mark a mistaken record void with the documented reason. This never sends a refund or deletes history.
- /draft-thanks: Draft an email acknowledgement only when the email preference allows it. Open the file in drafts/ and review it. Never send.
- /draft-pledge: Read the pledge balance and preference. Draft the conversation in drafts/. Never send or charge.
- /draft-receipt: Read docs/compliance.md. Run receipt-review first. The result in drafts/ is explicitly not valid for tax claims. The operator verifies identity, letterhead, numbering and signature before any issuance elsewhere.
- /import: Read docs/replace-raisers-edge.md. Preview without --apply, reconcile the counts and separate currency/type totals, then apply the same bundle on instruction.
- /export: Export the full base record set, audit and import provenance into a new file. Protect donor data. This does not replace tested database backups.
- /help: List the CLI commands and open docs/cli.md for arguments.
- /customise: Add a field or rule through a tested numbered migration.
- /new-view: Add a read-only dashboard from your own records.

## Ten questions beyond a fixed dashboard

Every question below is answered by the base today. Raiser’s Edge supports configurable queries too. We do not claim these questions are impossible there. Your rules and the analysis stay editable in your own system.

1. Which unpaid pledges fall due in the next month? `npm run fundraising -- pledges-due`
2. Which promised gift is overdue despite a partial payment? `npm run fundraising -- pledges-due`
3. Which donor calls are overdue and which are blocked? `npm run fundraising -- call-cycle`
4. Who last gave more than a year ago and has an overdue action? `npm run fundraising -- lapsed-donors`
5. Which gifts still need a personal thank-you? `npm run fundraising -- thank-you-queue`
6. How far is each campaign from its cash goal without counting unpaid pledges? `npm run fundraising -- campaigns`
7. How much cash arrived for each restricted purpose? `npm run fundraising -- fund-balances`
8. What did each appeal raise after its recorded costs? `npm run fundraising -- appeals`
9. Which donation records lack the details needed to prepare a receipt? `npm run fundraising -- receipt-review`
10. What has each donor given in each currency? `npm run fundraising -- giving-summary`

## Your first hour: ten things to ask for

1. Put our charity's name, logo and colours on the paperwork.
2. Show the overdue promises and their remaining amounts.
3. Explain why the suppressed donor should not receive a draft.
4. Draft a thank-you for Aroha's latest gift.
5. Explain the missing receipt details.
6. Show how much cash came into each restricted fund.
7. Preview the sample export and reconcile its totals.
8. Add our donor relationship field through a migration.
9. Build a trustee view with separate currency totals.
10. Export a complete snapshot for a reconciliation review.

## Paperwork and views

Change brand.json once. npm run docs creates donation-receipt worksheets, pledge reminder worksheets and campaign statements under docs-out/. Every receipt is visibly a draft and is not valid for tax claims. An authorised person verifies eligibility, signs and issues the final receipt elsewhere. npm run view creates the week and governance snapshots under views/. /new-view uses that same renderer. No messages send.

[Compliance and receipt rules](docs/compliance.md) cite Inland Revenue and ATO guidance and label internal policies separately. [Why no front end](docs/why-no-front-end.md) explains mobile, offline and shared-access requirements.

## Bring your records

Follow the [Raiser’s Edge export and mapping guide](docs/replace-raisers-edge.md). A prepared CSV bundle imports with one command. Preview first, then use --apply after counts and totals reconcile. IDs protect repeat imports. Changed source records fail for review instead of overwriting local changes. The entire import rolls back if any row fails.

Online payment forms, tokens, bank feeds, gift splits, soft credits, membership and event records, wealth data, attachments and signed receipts need a separately scoped mapping or their original archive. Pledges have one due date per commitment. Shared deployment and production privacy controls are configured per charity. This base does not issue receipts, take payments or produce statutory returns.

## Verification

npm test uses a temporary database, seeds twice, exercises every CLI command and checks currency separation, overpayment prevention, rollback, repeat import, consent suppression, draft receipts, exports and branded documents. Windows and Linux use the same Node scripts and portable paths. The CI workflow runs both and tests a PostgreSQL database separately.

MIT. Built by Enterprise DNA. Not affiliated with Blackbaud or Anthropic. [Omni by Enterprise DNA](https://enterprisedna.co/omni/instead-of/raisers-edge?utm_source=github&utm_medium=readme&utm_campaign=raisers-edge).
