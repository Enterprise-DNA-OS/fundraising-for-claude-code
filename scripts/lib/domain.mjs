import fs from 'node:fs';
import path from 'node:path';
import {REPO_ROOT} from './db.mjs';
export const entities={
 organisations:['name','country','currency','tax_number','charity_number','eligibility_verified','authorised_name','authorised_role'],
 constituents:['external_id','name','kind','email','owner','deceased','do_not_contact'],
 campaigns:['external_id','name','currency','goal','end_date'],funds:['external_id','name','restricted','purpose'],
 appeals:['external_id','name','campaign_id','currency','cost'],
 pledges:['external_id','name','constituent_id','campaign_id','currency','amount','due_date'],
 gifts:['external_id','name','constituent_id','organisation_id','campaign_id','fund_id','appeal_id','pledge_id','currency','amount','gift_date','gift_type','benefit_received','source_ref'],
 actions:['external_id','name','constituent_id','due_date','channel','owner','notes'],
 relationships:['external_id','name','constituent_id','related_id','kind']
};
export const reads={
 organisations:'select * from organisations order by name',
 constituents:'select id,name,kind,email,owner,deceased,do_not_contact from constituents order by name',
 gifts:"select g.id,g.name,c.name donor,g.currency,g.amount,g.gift_date,g.gift_type,g.status,g.source_ref from gifts g join constituents c on c.id=g.constituent_id order by g.gift_date desc,g.name",
 campaigns:'select * from campaign_results order by name',
 funds:'select * from funds order by name',
 appeals:"select a.name,a.currency,a.cost,coalesce(sum(g.amount) filter(where g.status='received' and g.gift_type='cash'),0)::numeric(14,2) received,(coalesce(sum(g.amount) filter(where g.status='received' and g.gift_type='cash'),0)-a.cost)::numeric(14,2) net_after_appeal_cost from appeals a left join gifts g on g.appeal_id=a.id group by a.id order by a.name",
 pledges:'select * from pledge_balances order by due_date,name',
 'pledges-due':"select name,donor,currency,promised,received,balance,due_date,owner from pledge_balances where status='open' and balance>0 and due_date<=current_date+30 order by due_date,name",
 'call-cycle':"select name,donor,owner,channel,due_date,contact_status from stewardship_queue where due_date<=current_date+7 order by due_date,name",
 attention:"select name,owner,last_gift,last_contact,overdue_actions from donor_health where overdue_actions>0 or last_gift<current_date-365 order by name",
 'lapsed-donors':"select name,owner,last_gift,last_contact,overdue_actions from donor_health where last_gift<current_date-365 and not deceased and not do_not_contact order by last_gift,name",
 'thank-you-queue':"select g.name,c.name donor,g.currency,g.amount,g.gift_date,case when c.deceased or c.do_not_contact then 'suppressed' when p.status='allowed' then 'allowed' else 'review permission' end contact_status from gifts g join constituents c on c.id=g.constituent_id left join preferences p on p.constituent_id=c.id and p.channel='email' where g.status='received' and g.acknowledged_at is null order by g.gift_date,g.name",
 'fund-balances':'select name,restricted,purpose,currency,received from fund_totals order by name,currency',
 'receipt-review':'select name,donor,currency,amount,country,blockers from receipt_checks order by name',
 compliance:'select * from compliance_findings order by rule,record',
 actions:'select * from actions order by due_date,name',
 relationships:'select r.id,c.name constituent,d.name related,r.kind from relationships r join constituents c on c.id=r.constituent_id join constituents d on d.id=r.related_id order by c.name,d.name',
 preferences:'select c.name,p.channel,p.status,p.evidence,p.recorded_on from preferences p join constituents c on c.id=p.constituent_id order by c.name,p.channel',
 audit:'select event,record_id,detail,created_at from audit order by created_at,id',
 'giving-summary':"select c.name donor,g.currency,count(*) gifts,sum(g.amount)::numeric(14,2) received from constituents c join gifts g on g.constituent_id=c.id where g.status='received' and g.gift_type='cash' group by c.id,g.currency order by c.name,g.currency"
};
export async function resolve(db,entity,term){
 if(!entities[entity])throw Error('Unknown entity '+entity);if(!term)throw Error('A record name or ID is required');
 let rows=await db.query(`select * from ${entity} where id::text=$1 or lower(name)=lower($1)`,[term]);
 if(!rows.length)rows=await db.query(`select * from ${entity} where starts_with(id::text,$1) or position(lower($1) in lower(name))>0 order by name`,[term]);
 if(rows.length!==1)throw Error(rows.length?`Ambiguous ${entity}:\n${rows.map(x=>x.id+' '+x.name).join('\n')}`:`No ${entity} match: ${term}`);
 return rows[0];
}
export function date(value){const s=String(value||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||Number.isNaN(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error('Date must be a real YYYY-MM-DD: '+s);return s;}
export function amount(value){const s=String(value);if(!/^\d+(\.\d{1,2})?$/.test(s)||!Number.isFinite(Number(s))||Number(s)>999999999999.99)throw Error('Invalid money amount: '+s);return s;}
export function validate(entity,data){
 if(!entities[entity])throw Error('Unknown entity '+entity);
 for(const [key,value] of Object.entries(data)){
  if(!entities[entity].includes(key))throw Error('Unknown or protected field: '+key);
  if(value===null){if(!['external_id','appeal_id','pledge_id'].includes(key))throw Error('Null not allowed: '+key);continue;}
  if(['amount','goal','cost'].includes(key))data[key]=amount(value);
  if(['end_date','due_date','gift_date'].includes(key))data[key]=date(value);
  if(['deceased','do_not_contact','restricted','eligibility_verified','benefit_received'].includes(key)&&typeof value!=='boolean')throw Error('Boolean required: '+key);
  if(key==='name'&&!String(value).trim())throw Error('Name required');
 }
 return data;
}
export async function audit(db,event,id,detail){await db.query('insert into audit(event,record_id,detail) values($1,$2,$3)',[event,id,JSON.stringify(detail)]);}
export async function transaction(db,fn){await db.exec('begin');try{const result=await fn();await db.exec('commit');return result;}catch(e){await db.exec('rollback');throw e;}}
export async function add(db,entity,data){validate(entity,data);const keys=Object.keys(data);if(!keys.length)throw Error('Fields required');const [row]=await db.query(`insert into ${entity}(${keys}) values(${keys.map((_,i)=>'$'+(i+1))}) returning *`,Object.values(data));await audit(db,'add '+entity,row.id,data);return row;}
export function draft(name,body){const dir=path.join(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,name+'.md');fs.writeFileSync(file,body);return {file,status:'draft only; nothing sent'};}
export async function contactAllowed(db,donor,channel){
 const [d]=await db.query('select * from constituents where id=$1',[donor]);
 const [p]=await db.query('select status from preferences where constituent_id=$1 and channel=$2',[donor,channel]);
 if(d.deceased||d.do_not_contact||p?.status!=='allowed')throw Error('Contact suppressed or permission not recorded for '+channel);
 return d;
}
