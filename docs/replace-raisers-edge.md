# Replace Raiser's Edge NXT: export and reconcile

Blackbaud documents configurable [Query CSV or XLSX export](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-query.html) and [decommissioning resources](https://www.blackbaud.com/contract-review-resources). Checked 28 September 2026. There is no universal set of CSV headings for every NXT account.

1. In Analysis, Query, select the appropriate record type and output fields. Run the query. With export rights, choose Export and CSV. Retain original exports securely. Export constituent, campaign, fund, appeal, gift, action and relationship records separately. Prepare pledges as a separate commitment file. Never count pledge commitments as cash gifts.
2. Map the exports to the bundle below. Preserve record IDs as text, including leading zeroes. Export one row per record. Gift splits must first be reconciled into individually identified gift allocations; do not flatten joined multi-row exports and count them twice. Use YYYY-MM-DD dates and decimal amounts without grouping or currency symbols. Convert XLSX to CSV explicitly before import.
3. Start a fresh database with npm run migrate, without demo seed. Add your organisation with country, currency and independently verified identity details. Preview, reconcile, then import the same folder.

```bash
npm run fundraising -- add organisations '{"name":"Your charity","country":"NZ","currency":"NZD"}'
npm run fundraising -- import raisers-edge ./exports "Your charity"
npm run fundraising -- import raisers-edge ./exports "Your charity" --apply
```

Shell quoting differs on Windows. Put JSON fields in a variable or use the agent to pass one intact argument. The import command itself uses portable paths and does not invoke a shell. For the included fictional demo, use organisation "Harbour Literacy Trust NZ" and folder fixtures/raisers-edge.

## Supported bundle

Optional files import in this dependency order. Required references must exist in the same bundle or an earlier import. Select these fields and map their output labels. The example fixture headers are authoritative. The importer does not silently infer missing field meanings.

| File | Identity and supported headings |
|---|---|
| constituents.csv | Constituent ID, Name (or Constituent Name), Constituent Type, Email (or Email Address), Fundraiser, Do Not Contact, Deceased |
| campaigns.csv | Campaign ID, Campaign Description (or Campaign), Currency, Goal, End Date |
| funds.csv | Fund ID, Fund Description (or Fund), Restricted, Purpose |
| appeals.csv | Appeal ID, Appeal Description (or Appeal), Campaign ID, Currency, Cost |
| pledges.csv | Pledge ID, Pledge Reference, Constituent ID, Campaign ID, Currency, Pledge Amount, Due Date |
| gifts.csv | Gift ID, Gift Reference, Constituent ID, Campaign ID, Fund ID, Appeal ID, Pledge ID, Currency, Gift Amount (or Amount), Gift Date (or Date), Gift Type, Benefit Received, Payment Reference |
| actions.csv | Action ID, Action Summary, Constituent ID, Action Date, Channel, Fundraiser, Notes |
| relationships.csv | Relationship ID, Relationship Description, Constituent ID, Related Constituent ID, Relationship Type |

Gift Reference falls back to RE- plus Gift ID. Pledge Reference falls back to RE-PLEDGE- plus Pledge ID. Gift Type accepts Cash, Pay-Cash, Gift-in-Kind, In Kind, cash and in_kind. Anything else fails for review. Use a single currency and receiving organisation per gift bundle. Currency is never converted. Benefit Received records a reviewed Yes or No. Export payment evidence or preserve its archive reference. Every action imports as open; completed historical actions need a separate explicit mapping before use. Full pledge instalment schedules need mapping to separate commitments; each base pledge has one due date.

Preview writes inside a rolled-back transaction and reports file counts and gift sums by currency and type. Apply validates the entire folder in one transaction. Duplicate IDs inside a file fail. Repeating identical source data skips existing rows. Changed source data fails with a reconciliation message; it never overwrites subsequent local work. Any failure rolls the entire bundle back. No permissions are inferred from contact addresses. Record channel preferences with their original evidence before drafting correspondence.

## Reconcile before switching

Compare constituent counts, cash by currency, in-kind records, outstanding promises, appeal totals, restricted-fund receipts and a sample of donor histories. Investigate every difference against the original exports. Run compliance and receipt-review. Test a backup and restore. Keep both systems until the operator accepts the reconciliation and planned workflows.

The prepared bundle imports in one command. Preparing mappings and checking history still takes work. Enterprise DNA handles that work in a custom installation. No promise is made that an arbitrary unmodified export imports automatically.

Online donation forms, payment tokens, bank feeds, gift splits, soft credits, recurring payment schedules, memberships, event tickets, prospect wealth data, attachments, full consent history and original signed receipts are not imported by this base. Keep them in their original archive or scope a tested migration. Payment processing stays with its provider. A complete JSON export includes all base records, audit and import history; it is not a database restore tool. Use tested database backups for recovery.
