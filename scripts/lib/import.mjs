import fs from 'node:fs';
import path from 'node:path';
import {parseCsv,pick} from './csv.mjs';
import {add,validate,audit} from './domain.mjs';
// Query exports are configurable. These labels and filenames are the supported bundle contract.
export const specs={
 'constituents.csv':{entity:'constituents',id:'Constituent ID',fields:{name:['Name','Constituent Name'],kind:['Constituent Type'],email:['Email','Email Address'],owner:['Fundraiser'],do_not_contact:['Do Not Contact'],deceased:['Deceased']}},
 'campaigns.csv':{entity:'campaigns',id:'Campaign ID',fields:{name:['Campaign Description','Campaign'],currency:['Currency'],goal:['Goal'],end_date:['End Date']}},
 'funds.csv':{entity:'funds',id:'Fund ID',fields:{name:['Fund Description','Fund'],restricted:['Restricted'],purpose:['Purpose']}},
 'appeals.csv':{entity:'appeals',id:'Appeal ID',fields:{name:['Appeal Description','Appeal'],campaign_id:['Campaign ID'],currency:['Currency'],cost:['Cost']}},
 'pledges.csv':{entity:'pledges',id:'Pledge ID',fields:{name:['Pledge Reference'],constituent_id:['Constituent ID'],campaign_id:['Campaign ID'],currency:['Currency'],amount:['Pledge Amount'],due_date:['Due Date']}},
 'gifts.csv':{entity:'gifts',id:'Gift ID',fields:{name:['Gift Reference'],constituent_id:['Constituent ID'],campaign_id:['Campaign ID'],fund_id:['Fund ID'],appeal_id:['Appeal ID'],pledge_id:['Pledge ID'],currency:['Currency'],amount:['Gift Amount','Amount'],gift_date:['Gift Date','Date'],gift_type:['Gift Type'],benefit_received:['Benefit Received'],source_ref:['Payment Reference']}},
 'actions.csv':{entity:'actions',id:'Action ID',fields:{name:['Action Summary'],constituent_id:['Constituent ID'],due_date:['Action Date'],channel:['Channel'],owner:['Fundraiser'],notes:['Notes']}},
 'relationships.csv':{entity:'relationships',id:'Relationship ID',fields:{name:['Relationship Description'],constituent_id:['Constituent ID'],related_id:['Related Constituent ID'],kind:['Relationship Type']}}
};
const refs={constituent_id:'constituents',related_id:'constituents',campaign_id:'campaigns',fund_id:'funds',appeal_id:'appeals',pledge_id:'pledges'};
const bools=['do_not_contact','deceased','restricted','benefit_received'];
export async function importBundle(db,dir,organisation,apply=false){
 const files=Object.keys(specs).filter(f=>fs.existsSync(path.join(dir,f)));if(!files.length)throw Error('No supported CSV files in bundle');
 const result={applied:apply,inserted:0,skipped:0,files:[],totals:[]};const totals={};
 await db.exec('begin');
 try{
 for(const file of files){const spec=specs[file];const rows=parseCsv(fs.readFileSync(path.join(dir,file),'utf8'));const seen=new Set();
 for(const [index,row] of rows.entries()){
 try{
 const external_id=pick(row,spec.id);if(!external_id.trim())throw Error(spec.id+' required');if(seen.has(external_id))throw Error('Duplicate '+spec.id+' '+external_id);seen.add(external_id);
 const data={external_id};
 for(const [field,names] of Object.entries(spec.fields)){
 let value=pick(row,...names);
 if(!value){if(['email','owner','notes','purpose','source_ref'].includes(field))data[field]='';continue;}
 if(refs[field]){const found=await db.query(`select id from ${refs[field]} where external_id=$1`,[value]);if(found.length!==1)throw Error('Unmapped '+field+' '+value);value=found[0].id;}
 if(bools.includes(field)){if(!/^(yes|no|true|false|1|0)$/i.test(value))throw Error('Invalid boolean '+field);value=/^(yes|true|1)$/i.test(value);}
 if(field==='gift_type'){value=({'Cash':'cash','Pay-Cash':'cash','Gift-in-Kind':'in_kind','In Kind':'in_kind'})[value]||value;if(!['cash','in_kind'].includes(value))throw Error('Unsupported Gift Type '+value+'; exclude pledge commitments, recurring schedules and soft credits');}
 if(field==='kind'&&spec.entity==='constituents')value=({'Individual':'individual','Organization':'organisation','Organisation':'organisation'})[value]||value;
 if(field==='channel')value=value.toLowerCase();
 data[field]=value;
 }
 if(spec.entity==='gifts'){
  data.organisation_id=organisation.id;
  if(!data.name)data.name='RE-'+external_id;
  if(!data.gift_type)throw Error('Gift Type required');
  if(typeof data.benefit_received!=='boolean')throw Error('Benefit Received requires an explicit reviewed Yes or No');
 }
 if(spec.entity==='pledges'&&!data.name)data.name='RE-PLEDGE-'+external_id;
 if(spec.entity==='actions'&&!data.channel)throw Error('Channel required');
 validate(spec.entity,data);
 const source='raisers-edge:'+spec.entity+':'+external_id;
 const [prior]=await db.query('select payload from import_sources where name=$1',[source]);
 if(prior){if(JSON.stringify(prior.payload,Object.keys(prior.payload).sort())!==JSON.stringify(data,Object.keys(data).sort()))throw Error('Source changed since import; reconcile explicitly');result.skipped++;}
 else{
  if((await db.query(`select id from ${spec.entity} where external_id=$1`,[external_id])).length)throw Error('External ID already exists without this import record');
  await add(db,spec.entity,data);await db.query('insert into import_sources(name,payload) values($1,$2)',[source,JSON.stringify(data)]);result.inserted++;
 }
 if(spec.entity==='gifts'){const key=data.currency+':'+data.gift_type;totals[key]=(totals[key]||0n)+BigInt(String(data.amount).split('.')[0])*100n+BigInt((String(data.amount).split('.')[1]||'').padEnd(2,'0'));}
 }catch(e){throw Error(`${file} row ${index+2}: ${e.message}`);}
 }
 result.files.push({file,rows:rows.length});
 }
 result.totals=Object.entries(totals).map(([key,cents])=>({currency_and_type:key,amount:(Number(cents)/100).toFixed(2)}));
 if(apply){await audit(db,'import raisers-edge',null,result);await db.exec('commit');}else await db.exec('rollback');
 return result;
 }catch(e){await db.exec('rollback');throw e;}
}
