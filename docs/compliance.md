# Record checks and receipt preparation

Checked 28 September 2026. These checks find missing records. They do not certify a charity, issue tax receipts, assess a donor's tax position or file returns. Payment processing remains with the payment provider. An authorised operator reviews the documents.

## Receipts

NZ source: [Inland Revenue receipt requirements](https://www.ird.govt.nz/roles/not-for-profits-and-charities/running-your-nfp/requirements-for-creating-donation-receipts). A receipt needs donor identity, monetary value, donation date or tax year, donation wording, donee name and IRD number, charity registration where applicable, official letterhead or stamp, and authorised name, role and signature. Use a distinct receipt number where applicable and identify replacements. Property donations do not qualify for NZ donation tax credits.

AU source: [ATO gifts and donations guidance](https://www.ato.gov.au/api/public/content/e077b327-78b2-450c-b1bb-1b0d61be28fa_TaxTimeToolkit_Giftsanddonations_pdf). DGR status matters. A gift receipt identifies the receiving fund, authority or institution, its ABN where applicable, and that the payment is a gift. Some named-law DGRs have no ABN. Material benefits and non-cash donations require specific review.

The receipt_checks view rejects void records, non-cash gifts, benefit-bearing gifts, unverified organisation eligibility, absent tax identifiers and missing NZ signatory details. It also flags missing payment evidence and future dates as internal controls. Our conservative ABN rule requires manual handling for the named-law exception. An eligibility flag records an operator's check, not an external verification. The demo flags are false and its identifiers are fictional.

The CLI drafts a receipt only when these checks clear. Every generated receipt is marked DRAFT and NOT VALID FOR TAX CLAIMS. The HTML worksheet also shows blockers so staff can correct records. The operator must verify the remaining requirements, print on official letterhead, allocate a unique final number, obtain the actual authorised signature where required and mark copies. There is no receipt issuance ledger or automatic signature. Keep final signed receipts in your controlled records system.

## Contact policy

The internal policy blocks correspondence drafts when the donor is deceased, marked do-not-contact, or lacks an explicit allowed preference for the chosen channel. Unknown consent is never inferred from a historical gift or imported email address. The call-cycle lists permission status for human review. A completion records work actually done, including internal review; it never sends.

[Blackbaud's communication preferences documentation](https://docs.blackbaud.com/communication-preferences/products/re-nxt) explains the incumbent's channel preferences. The base models explicit channel permissions and retained evidence. This is an internal conservative workflow, not an assertion that every contact legally requires consent. Have your adviser map the charity's actual privacy and communication obligations before use.

## Internal controls

Restricted funds need a purpose. The view reports receipts into those funds; it does not subtract expenditure or certify compliance with donor restrictions. Gifts cannot exceed the linked pledge's remaining value. Donor, campaign and currency must match. Void gifts keep their reason and stop contributing to cash and pledge totals. Each CLI change is audited.

Cash and outstanding pledges are distinct. Cash and in-kind totals stay separate. NZD and AUD are never summed together. This is fundraising operations, not statutory accounts, Charities Services or ACNC annual returns. Reconcile to your accounts and payment provider. Scope annual-return mapping, storage retention, access control, backups and privacy requests for the organisation before a shared installation.
