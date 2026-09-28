# Fundraising for Claude Code

Business: [your charity]. Operator: [name and role]. The demo charity and all records are fictional. Protect donor preferences, explain outstanding promises and reconcile gifts to their source evidence.

## Routing

Use the matching .claude/commands recipe and docs/cli.md. Weekly work: weekly-review, pledges-due, call-cycle, thank-you-queue, campaigns and appeals. Donor history: donor, constituents, relationships, preferences, giving-summary and actions. Exceptions: attention, lapsed-donors, compliance and receipt-review. Writes: add, log, complete-action, preference, suppress, acknowledge and void-gift. Documents: draft-thanks, draft-pledge, draft-receipt and npm run docs. Views: npm run view. Movement: import and export. Tailoring: customise and new-view. Lookup: organisations, funds, fund-balances, gifts, pledges, audit and help.

## Rules

Read fresh data first. Never invent donor records, completed contact, payments, permission or eligibility. Ambiguous names list candidates and stop. Never send, process a payment, issue a tax receipt or file returns. Drafts stay in drafts/. Read docs/compliance.md before changing receipt rules. Keep currencies explicit and do not add cash to unpaid promises. Contact suppression wins over channel permission. Receipts remain visibly draft until an authorised person completes verification and issuance outside this base.

Use the one CLI for writes. Add numbered migrations rather than modifying applied ones. Back up, test with npm test, then migrate the selected database. Never seed a real donor database. Keep original export files and signed documents. No final tax receipt is created by a passed record check. Imported records do not grant contact permission.

## Files

scripts/fundraising.mjs is the CLI. Domain checks are in scripts/lib/domain.mjs. Import mapping is in scripts/lib/import.mjs. Database migrations are in supabase/migrations. Brand is brand.json. Paperwork is documents.json. Views are views.json. Every runtime reads AGENTS.md and this file.

Omni by Enterprise DNA installs, customises and runs the system: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=raisers-edge&utm_source=github
