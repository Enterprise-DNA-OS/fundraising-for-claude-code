create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table organisations(id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name))>0), country text not null check(country in ('NZ','AU')), currency text not null check(currency in ('NZD','AUD')), tax_number text not null default '', charity_number text not null default '', eligibility_verified boolean not null default false, authorised_name text not null default '', authorised_role text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger organisations_updated before update on organisations for each row execute function touch_updated_at();
create table constituents(id uuid primary key default gen_random_uuid(), external_id text unique, name text not null check(length(trim(name))>0), kind text not null default 'individual' check(kind in ('individual','organisation')), email text not null default '', owner text not null default '', deceased boolean not null default false, do_not_contact boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger constituents_updated before update on constituents for each row execute function touch_updated_at();
create table campaigns(id uuid primary key default gen_random_uuid(), external_id text unique, name text not null check(length(trim(name))>0), currency text not null check(currency in ('NZD','AUD')), goal numeric(14,2) not null default 0 check(goal>=0), end_date date not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger campaigns_updated before update on campaigns for each row execute function touch_updated_at();
create table funds(id uuid primary key default gen_random_uuid(), external_id text unique, name text not null check(length(trim(name))>0), restricted boolean not null default false, purpose text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger funds_updated before update on funds for each row execute function touch_updated_at();
create table appeals(id uuid primary key default gen_random_uuid(), external_id text unique, name text not null check(length(trim(name))>0), campaign_id uuid not null references campaigns(id), currency text not null check(currency in ('NZD','AUD')), cost numeric(14,2) not null default 0 check(cost>=0), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger appeals_updated before update on appeals for each row execute function touch_updated_at();
create table pledges(id uuid primary key default gen_random_uuid(), external_id text unique, name text not null, constituent_id uuid not null references constituents(id), campaign_id uuid not null references campaigns(id), currency text not null check(currency in ('NZD','AUD')), amount numeric(14,2) not null check(amount>0), due_date date not null, status text not null default 'open' check(status in ('open','cancelled')), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger pledges_updated before update on pledges for each row execute function touch_updated_at();
create table gifts(id uuid primary key default gen_random_uuid(), external_id text unique, name text not null unique, constituent_id uuid not null references constituents(id), organisation_id uuid not null references organisations(id), campaign_id uuid not null references campaigns(id), fund_id uuid not null references funds(id), appeal_id uuid references appeals(id), pledge_id uuid references pledges(id), currency text not null check(currency in ('NZD','AUD')), amount numeric(14,2) not null check(amount>0), gift_date date not null, gift_type text not null default 'cash' check(gift_type in ('cash','in_kind')), benefit_received boolean not null default false, status text not null default 'received' check(status in ('received','void')), source_ref text not null default '', acknowledged_at date, void_reason text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger gifts_updated before update on gifts for each row execute function touch_updated_at();
create table actions(id uuid primary key default gen_random_uuid(), external_id text unique, name text not null, constituent_id uuid not null references constituents(id), due_date date not null, completed_at date, channel text not null default 'phone' check(channel in ('phone','email','post','meeting')), owner text not null default '', notes text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger actions_updated before update on actions for each row execute function touch_updated_at();
create table relationships(id uuid primary key default gen_random_uuid(), external_id text unique, name text not null, constituent_id uuid not null references constituents(id), related_id uuid not null references constituents(id), kind text not null, check(constituent_id<>related_id), unique(constituent_id,related_id,kind), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger relationships_updated before update on relationships for each row execute function touch_updated_at();
create table preferences(id uuid primary key default gen_random_uuid(), constituent_id uuid not null references constituents(id), channel text not null check(channel in ('phone','email','post','meeting')), status text not null check(status in ('allowed','blocked','unknown')), evidence text not null, recorded_on date not null, unique(constituent_id,channel), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger preferences_updated before update on preferences for each row execute function touch_updated_at();
create table audit(id uuid primary key default gen_random_uuid(), event text not null, record_id uuid, detail jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger audit_updated before update on audit for each row execute function touch_updated_at();
create table import_sources(id uuid primary key default gen_random_uuid(), name text not null unique, payload jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger import_sources_updated before update on import_sources for each row execute function touch_updated_at();

create index gifts_donor_date on gifts(constituent_id,gift_date);
create index gifts_pledge on gifts(pledge_id);
create index actions_donor_due on actions(constituent_id,due_date);
create function check_fundraising_links() returns trigger language plpgsql as $$
declare c text; p pledges%rowtype; a appeals%rowtype;
begin
 if TG_TABLE_NAME in ('appeals','pledges','gifts') then
  select currency into c from campaigns where id=new.campaign_id;
  if c<>new.currency then raise exception 'Campaign currency mismatch'; end if;
 end if;
 if TG_TABLE_NAME='gifts' then
  select currency into c from organisations where id=new.organisation_id;
  if c<>new.currency then raise exception 'Organisation currency mismatch'; end if;
  if new.appeal_id is not null then
   select * into a from appeals where id=new.appeal_id;
   if a.campaign_id<>new.campaign_id or a.currency<>new.currency then raise exception 'Appeal campaign mismatch'; end if;
  end if;
  if new.pledge_id is not null then
   select * into p from pledges where id=new.pledge_id for update;
   if p.constituent_id<>new.constituent_id or p.campaign_id<>new.campaign_id or p.currency<>new.currency or p.status<>'open' or new.gift_type<>'cash' then raise exception 'Pledge donor, campaign, currency or status mismatch'; end if;
   if new.status='received' and new.amount + coalesce((select sum(amount) from gifts where pledge_id=new.pledge_id and status='received' and id<>new.id),0)>p.amount then raise exception 'Gift exceeds pledge balance'; end if;
  end if;
  if new.status='void' and length(trim(new.void_reason))=0 then raise exception 'Void reason required'; end if;
 end if;
 return new;
end $$;
create trigger gifts_links before insert or update on gifts for each row execute function check_fundraising_links();
create trigger pledges_links before insert or update on pledges for each row execute function check_fundraising_links();
create trigger appeals_links before insert or update on appeals for each row execute function check_fundraising_links();
create view pledge_balances as
select p.id,p.name,c.name donor,p.currency,p.amount promised,coalesce(sum(g.amount) filter(where g.status='received'),0)::numeric(14,2) received,
(p.amount-coalesce(sum(g.amount) filter(where g.status='received'),0))::numeric(14,2) balance,p.due_date,p.status,c.owner
from pledges p join constituents c on c.id=p.constituent_id left join gifts g on g.pledge_id=p.id group by p.id,c.id;
create view donor_health as
select c.id,c.name,c.owner,c.deceased,c.do_not_contact,
(select max(g.gift_date) from gifts g where g.constituent_id=c.id and g.status='received' and g.gift_type='cash') last_gift,
(select max(a.completed_at) from actions a where a.constituent_id=c.id) last_contact,
(select count(*) from actions a where a.constituent_id=c.id and a.completed_at is null and a.due_date<current_date) overdue_actions
from constituents c;
create view campaign_results as
select c.id,c.name,c.currency,c.goal,c.end_date,
coalesce((select sum(g.amount) from gifts g where g.campaign_id=c.id and g.status='received' and g.gift_type='cash'),0)::numeric(14,2) received,
coalesce((select sum(b.balance) from pledge_balances b join pledges p on p.id=b.id where p.campaign_id=c.id and p.status='open'),0)::numeric(14,2) outstanding,
(c.goal-coalesce((select sum(g.amount) from gifts g where g.campaign_id=c.id and g.status='received' and g.gift_type='cash'),0))::numeric(14,2) cash_gap
from campaigns c;
create view stewardship_queue as
select a.id,a.name,c.name donor,a.owner,a.channel,a.due_date,
case when c.deceased then 'deceased' when c.do_not_contact then 'do not contact'
when p.status='allowed' then 'allowed' when p.status='blocked' then 'blocked' else 'permission unknown' end contact_status
from actions a join constituents c on c.id=a.constituent_id left join preferences p on p.constituent_id=c.id and p.channel=a.channel where a.completed_at is null;
create view fund_totals as
select f.id,f.name,f.restricted,f.purpose,g.currency,sum(g.amount)::numeric(14,2) received
from funds f join gifts g on g.fund_id=f.id where g.status='received' and g.gift_type='cash' group by f.id,g.currency;
create view receipt_checks as
select g.id,g.name,c.name donor,g.currency,g.amount,g.gift_date,o.country,o.name organisation,o.tax_number,o.charity_number,o.authorised_name,o.authorised_role,
concat_ws('; ',case when g.status<>'received' then 'Void gift' end,
case when g.gift_type<>'cash' then 'Non-cash gift needs specialist review' end,
case when g.benefit_received then 'Benefit received: eligibility review required' end,
case when not o.eligibility_verified then 'Organisation eligibility not verified' end,
case when o.tax_number='' then 'Missing IRD number or ABN; AU named-law exception needs manual review' end,
case when o.country='NZ' and (o.authorised_name='' or o.authorised_role='') then 'Missing authorised NZ signatory details' end,
case when g.source_ref='' then 'Missing payment evidence (internal control)' end,
case when g.gift_date>current_date then 'Future gift date (internal control)' end) blockers
from gifts g join constituents c on c.id=g.constituent_id join organisations o on o.id=g.organisation_id;
create view compliance_findings as
select name record,'RECEIPT' rule,blockers finding,'docs/compliance.md#receipts' source from receipt_checks where blockers<>''
union all select name,'CONTACT',contact_status,'docs/compliance.md#contact-policy' from stewardship_queue where contact_status<>'allowed'
union all select name,'RESTRICTION','Restricted fund has no purpose','docs/compliance.md#internal-controls' from funds where restricted and purpose='';
