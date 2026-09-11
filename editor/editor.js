const form=document.getElementById('fields');
const preview=document.getElementById('preview');
const save=document.getElementById('save');
const status=document.getElementById('status');
const error=document.getElementById('error');
const token=document.querySelector('meta[name="editor-token"]').content;
let profile,dirty=false,timer,revision=0;
const showError=message=>{error.textContent=message;error.hidden=!message;};
const setDirty=()=>{dirty=true;revision++;status.textContent='Unsaved changes';save.disabled=false;clearTimeout(timer);timer=setTimeout(updatePreview,220);};
function field(labelText,value,onChange,multiline=false){
  const label=document.createElement('label');label.append(document.createTextNode(labelText));
  const input=document.createElement(multiline?'textarea':'input');input.value=value;input.maxLength=5000;
  input.addEventListener('input',()=>{onChange(input.value);setDirty();});label.append(input);return label;
}
function group(title,open=false){const el=document.createElement('details');el.open=open;const summary=document.createElement('summary');summary.textContent=title;el.append(summary);form.append(el);return el;}
function collection(title,key,schema){
  const container=group(title);const list=document.createElement('div');container.append(list);
  function draw(){list.replaceChildren();profile[key].forEach((item,index)=>{
    const entry=document.createElement('div');entry.className='entry';const header=document.createElement('div');header.className='entry-header';
    const name=document.createElement('span');name.textContent=`Entry ${index+1}`;const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.className='remove';remove.setAttribute('aria-label',`Remove ${title} entry ${index+1}`);
    remove.onclick=()=>{profile[key].splice(index,1);draw();setDirty();add.focus();};header.append(name,remove);entry.append(header);
    for(const [key,label,multi] of schema)entry.append(field(label,item[key],v=>item[key]=v,multi));list.append(entry);
  });add.disabled=profile[key].length>=20;}
  const add=document.createElement('button');add.type='button';add.className='add';add.textContent='+ Add entry';
  add.onclick=()=>{profile[key].push(Object.fromEntries(schema.map(([key])=>[key,''])));draw();setDirty();list.lastElementChild.querySelector('input,textarea').focus();};container.append(add);draw();
}
async function api(path,data){const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json','X-Editor-Token':token},body:JSON.stringify(data)});if(!response.ok)throw new Error(await response.text());return response;}
async function updatePreview(){const version=revision;try{const response=await api('/api/preview',profile);const html=await response.text();if(version!==revision)return;const scroll=preview.contentWindow?.scrollY||0;preview.onload=()=>{preview.contentWindow.scrollTo(0,scroll);};preview.srcdoc=html;showError('');}catch(e){if(version===revision)showError(e.message);}}
save.addEventListener('click',async()=>{save.disabled=true;status.textContent='Saving…';const version=revision;try{await api('/api/save',profile);dirty=version!==revision;status.textContent=dirty?'Unsaved changes':'Saved to repository';save.disabled=!dirty;showError('');}catch(e){showError(e.message);status.textContent='Not saved';save.disabled=false;}});
document.querySelectorAll('[data-size]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-size]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));preview.classList.toggle('mobile',button.dataset.size==='mobile');}));
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
form.addEventListener('submit',event=>event.preventDefault());
try{
  const response=await fetch('/api/profile');if(!response.ok)throw new Error('Could not load profile.');profile=await response.json();
  const basics=group('Identity',true);
  for(const [key,label,multi] of [['name','Name'],['tagline','Brief sentence'],['intro','Introduction',true],['note','Draft note (clear to hide)']])basics.append(field(label,profile[key],v=>profile[key]=v,multi));
  const accentLabel=document.createElement('label');accentLabel.textContent='Accent color';const select=document.createElement('select');for(const color of ['violet','blue','forest','ink']){const option=document.createElement('option');option.value=color;option.textContent=color[0].toUpperCase()+color.slice(1);select.append(option);}select.value=profile.accent;select.onchange=()=>{profile.accent=select.value;setDirty();};accentLabel.append(select);basics.append(accentLabel);
  collection('Education','education',[['period','Dates'],['institution','University / institution'],['degree','Degree / field'],['detail','Description',true]]);
  collection('Research interests','research',[['title','Topic'],['description','Description',true]]);
  collection('Skills & tools','skills',[['category','Category'],['items','Skills (comma separated)',true]]);
  const contacts=group('Contacts');for(const [key,label,multi] of [['contactText','Invitation',true],['email','Email (blank to hide)'],['github','GitHub URL (blank to hide)'],['website','Website URL (optional)']])contacts.append(field(label,profile[key],v=>profile[key]=v,multi));
  status.textContent='All changes saved';
}catch(e){showError(e.message);status.textContent='Could not load';}
