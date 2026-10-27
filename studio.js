/* Resume studio and reusable career records. All user text is escaped at render time. */
state.basicProfile = state.basicProfile || Object.fromEntries(['name','contact','education'].map(k=>[k,state.resume[k]||'']));
state.careerHistory = Array.isArray(state.careerHistory) ? state.careerHistory : [];
if (!Array.isArray(state.resume.items)) state.resume.items=state.experiences.filter(e=>e.resumeText).map(e=>({id:crypto.randomUUID(),sourceId:e.id,title:e.title||'',company:'',position:'',period:'',resumeText:e.resumeText}));
state.resume.advantages=Array.isArray(state.resume.advantages)?state.resume.advantages:[];
const STUDIO_TEMPLATES=[
 {id:'classic',name:'留白经典',tag:'克制 · 清晰',description:'宽阔留白与细线分区，适合通用求职。'},
 {id:'editorial',name:'人文编辑',tag:'衬线 · 编辑',description:'衬线标题与细线分隔，适合内容与教育方向。'},
 {id:'executive',name:'商务序列',tag:'深墨 · 秩序',description:'墨色抬头、编号章节，突出结构与职业经历。'},
 {id:'modern',name:'理性网格',tag:'网格 · 现代',description:'中性灰阶与结构化信息表，适合技术与项目展示。'}
];
const gallery=document.createElement('section');gallery.className='studio-gallery';
gallery.innerHTML=STUDIO_TEMPLATES.map(t=>`<button class="template-card" data-studio-template="${t.id}" aria-label="选择${t.name}模板"><div class="template-mini ${t.id}" aria-hidden="true"><div class="mini-header"><b>YOUR NAME</b><span>YOUR NEXT CHAPTER</span></div><div class="mini-section"><i></i><em></em><em></em></div><div class="mini-section"><i></i><em></em><em></em><em></em></div><div class="mini-section"><i></i><em></em><em></em></div></div><div class="template-caption"><span>${t.tag}</span><h2>${t.name} <b>↗</b></h2><p>${t.description}</p></div></button>`).join('');
panels.studio.prepend(gallery);
const profileBlock=document.createElement('section');profileBlock.className='module-card';profileBlock.innerHTML='<span class="eyebrow">填写一次，随时调用</span><h2>基础信息档案</h2><p class="section-desc">姓名、联系方式和教育背景可单独存档。模板切换不会清空内容；简历归档后不会被资料库的修改影响。</p><div class="form-grid">'+[['name','姓名'],['contact','联系方式'],['education','教育背景']].map(([k,label])=>`<label>${label}<input data-basic="${k}" maxlength="${k==='name'?30:160}" value="${esc(state.basicProfile[k])}" placeholder="填写你的${label}"></label>`).join('')+'</div><button class="outline-button" id="storeBasic">保存基础信息档案</button>';panels.studio.append(profileBlock);
$('#storeBasic').onclick=()=>{document.querySelectorAll('[data-basic]').forEach(el=>state.basicProfile[el.dataset.basic]=el.value.trim());save();toast('基础信息已存档，可在简历编辑器中调用');};
gallery.onclick=e=>{const b=e.target.closest('[data-studio-template]');if(!b)return;state.resume.template=b.dataset.studioTemplate;save();openResume();};
const archiveShortcut=document.createElement('button');archiveShortcut.className='outline-button';archiveShortcut.dataset.room='studio';archiveShortcut.textContent='去 Let’s do it 制作简历 →';panels.resume.prepend(archiveShortcut);
panels.career.innerHTML='<div class="module-tools"><p class="section-desc">可手动填写工作、实习与项目经历。简历中保存的经历也会同步到这里。已归档的简历保留当时的版本。</p><button class="primary-button" id="newCareer">＋ 新增个人经历</button></div><div id="careerRecords" class="record-grid"></div>';
document.body.insertAdjacentHTML('beforeend',`<dialog id="careerDialog" class="small-dialog"><form id="careerForm"><div class="dialog-head"><h2>个人履历</h2><button type="button" class="icon-button" data-studio-close="careerDialog" aria-label="关闭">×</button></div><label>经历名称<input id="careerTitle" required maxlength="80" placeholder="例如：某公司实习 / 某项目"></label><div class="form-grid"><label>公司 / 组织<input id="careerCompany" maxlength="80"></label><label>岗位 / 职责<input id="careerPosition" maxlength="80"></label></div><label>时间<input id="careerPeriod" maxlength="60" placeholder="例如：2025.06—2025.09"></label><label>你做了什么<textarea id="careerDescription" required maxlength="2000" rows="6" placeholder="写下实际职责、采取的行动与能确认的结果，不必编造数字。"></textarea></label><button type="submit" class="primary-button">保存履历</button></form></dialog><dialog id="resourcePicker" class="small-dialog"><div class="dialog-head"><h2 id="pickerTitle"></h2><button class="icon-button" data-studio-close="resourcePicker" aria-label="关闭">×</button></div><p id="pickerHint" class="section-desc"></p><div id="pickerOptions"></div><button id="applyResources" class="primary-button">加入当前简历</button></dialog><dialog id="completeDialog" class="small-dialog"><span class="eyebrow">READY FOR YOUR NEXT CHAPTER</span><h2>简历做好了，要放进档案袋吗？</h2><p>草稿和个人经历已保存在本机。归档会另存一份独立版本。</p><label>版本名称<input id="completeName" maxlength="60" placeholder="例如：产品助理 · 秋招版"></label><div class="record-actions"><button id="confirmArchive" class="primary-button">保存到档案袋</button><button id="skipArchive" class="outline-button">暂不归档</button></div><button class="quiet-button" data-studio-close="completeDialog">返回继续编辑</button></dialog>`);
document.querySelectorAll('[data-studio-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.studioClose).close());
let careerEditId=null;
function renderCareer(){
 $('#careerRecords').innerHTML=state.careerHistory.length?state.careerHistory.map(item=>`<article class="module-record"><span class="record-status">${item.origin==='studio'?'来自简历制作 · 已同步':'个人填写'}</span><h3>${esc(item.title)}</h3><small>${esc([item.company,item.position,item.period].filter(Boolean).join(' · '))}</small><p>${esc(item.resumeText)}</p><button class="outline-button" data-edit-career="${esc(item.id)}">编辑履历</button></article>`).join(''):'<div class="module-empty"><h3>给第一段经历留个位置。</h3><p>手动添加，或在 Let’s do it 中填写简历后保存。</p></div>';
}
function editCareer(id){careerEditId=id;const item=state.careerHistory.find(x=>x.id===id)||{};for(const [el,key] of [['careerTitle','title'],['careerCompany','company'],['careerPosition','position'],['careerPeriod','period'],['careerDescription','resumeText']])$('#'+el).value=item[key]||'';$('#careerDialog').showModal();}
$('#newCareer').onclick=()=>editCareer(null);
$('#careerRecords').onclick=e=>{const b=e.target.closest('[data-edit-career]');if(b)editCareer(b.dataset.editCareer);};
$('#careerForm').onsubmit=e=>{e.preventDefault();const item={id:careerEditId||crypto.randomUUID(),origin:'manual',updatedAt:new Date().toISOString()};for(const [el,key] of [['careerTitle','title'],['careerCompany','company'],['careerPosition','position'],['careerPeriod','period'],['careerDescription','resumeText']])item[key]=$('#'+el).value.trim();if(!item.title||!item.resumeText){toast('请填写经历名称和具体内容');return;}const i=state.careerHistory.findIndex(x=>x.id===item.id);if(i<0)state.careerHistory.push(item);else state.careerHistory[i]=item;save();renderCareer();$('#careerDialog').close();toast('个人履历已保存');};
function syncCareerFromResume(){
 for(const item of state.resume.items){if(!item.resumeText.trim())continue;if(!item.careerId)item.careerId=crypto.randomUUID();const record={...structuredClone(item),id:item.careerId,title:item.title.trim()||[item.company,item.position].filter(Boolean).join(' · ')||'个人经历',origin:'studio',updatedAt:new Date().toISOString()};const i=state.careerHistory.findIndex(x=>x.id===record.id);if(i<0)state.careerHistory.push(record);else state.careerHistory[i]=record;}
 renderCareer();
}
const editor=$('#resumeDialog');
editor.querySelector('.dialog-head h2').textContent='Let’s do it · 简历制作';
editor.querySelector('.template-switch').innerHTML=STUDIO_TEMPLATES.map(t=>`<button data-studio-switch="${t.id}" class="template-button">${t.name}</button>`).join('');
$('#saveResumeVersion').textContent='保存草稿与履历';
$('#saveResumeVersion').insertAdjacentHTML('afterend','<button id="finishStudio" class="primary-button">完成简历 ✓</button>');
$('#optimizeBtn').hidden=true;
$('#aiNotice').textContent='仅调用你自己保存的资料。加入的经历与优势仍可逐条调整；未经确认的能力不会进入简历。';
editor.querySelector('.resume-editor').insertAdjacentHTML('afterbegin','<div class="studio-resource-bar"><button class="outline-button" id="loadBasic">调用基础信息</button><button class="outline-button" id="loadCareer">调用个人履历</button><button class="outline-button" id="loadAdvantages">调用已确认优势</button></div>');
$('#resumeItems').insertAdjacentHTML('beforebegin','<button id="addStudioExperience" class="outline-button">＋ 直接填写一段经历</button>');
const strengthBlock=document.createElement('div');strengthBlock.className='editor-block';strengthBlock.innerHTML='<h3>当前简历的优势</h3><p class="section-desc">来自优势资源库的已确认条目，副本修改不会覆盖资源库。</p><div id="studioAdvantages"></div>';editor.querySelector('.resume-editor').append(strengthBlock);
function markStudioTemplate(){document.querySelectorAll('[data-studio-switch]').forEach(b=>b.classList.toggle('active',b.dataset.studioSwitch===state.resume.template));}
document.querySelectorAll('[data-studio-switch]').forEach(b=>b.onclick=()=>{state.resume.template=b.dataset.studioSwitch;save();markStudioTemplate();renderPreview();});
renderResumeItems=function(){
 $('#resumeItems').innerHTML=state.resume.items.length?state.resume.items.map(item=>`<article class="resume-item studio-experience" data-item="${esc(item.id)}"><div class="resume-item-top"><strong>个人经历</strong><button class="quiet-button" data-remove-studio="${esc(item.id)}">从本简历移除</button></div><div class="form-grid">${[['title','经历名称'],['company','公司 / 组织'],['position','岗位 / 职责'],['period','起止时间']].map(([key,label])=>`<label>${label}<input data-item-field="${key}" maxlength="80" value="${esc(item[key]||'')}" placeholder="${label}"></label>`).join('')}</div><label class="resume-copy-label">个人经历描述<textarea data-item-field="resumeText" maxlength="2000" rows="5" placeholder="填写实际职责、行动与结果">${esc(item.resumeText||'')}</textarea></label></article>`).join(''):'<p class="empty-resume">直接新增经历，或从个人履历中勾选调用。</p>';
 $('#studioAdvantages').innerHTML=state.resume.advantages.length?state.resume.advantages.map(a=>`<article class="studio-strength" data-strength="${esc(a.id)}"><strong>${esc(a.title)}</strong><label>用于这份简历的优势表述<textarea data-strength-copy rows="3" maxlength="1500">${esc(a.text)}</textarea></label><button class="quiet-button" data-remove-strength="${esc(a.id)}">从本简历移除</button></article>`).join(''):'<p class="section-desc">点击“调用已确认优势”选择需要展示的内容。</p>';
};
function paperInfoRows(r){
 const rows=[];
 const parts=String(r.summary||'').split('；').map(x=>x.trim()).filter(Boolean);
 const labels={'背景':'专业背景','相关经历':'经历概览','能够完成':'核心技能','希望从事':'职业意向'};
 const structured=parts.length>0&&parts.every(x=>/^(背景|相关经历|能够完成|希望从事)：/.test(x));
 if(structured)for(const part of parts){const split=part.indexOf('：'),key=part.slice(0,split),value=part.slice(split+1).trim();if(value&&!(key==='希望从事'&&value===String(r.role||'').trim()))rows.push([labels[key],value]);}
 return {rows:rows.filter(([,value])=>String(value||'').trim()),summary:structured?'':String(r.summary||'').trim()};
}
function paperExperienceCopy(text){
 const parts=String(text||'').split(/；(?=主要承担：|具体做法：|可确认的结果：)/);
 if(parts.length>1&&parts.every(x=>/^(主要承担|具体做法|可确认的结果)：/.test(x)))return '<ul class="paper-bullets">'+parts.map(x=>'<li>'+esc(x.replace(/^(主要承担|具体做法|可确认的结果)：/,''))+'</li>').join('')+'</ul>';
 return '<p>'+esc(text)+'</p>';
}
function paperSection(title,content){return content?'<section class="paper-section"><h3>'+esc(title)+'</h3>'+content+'</section>':'';}
function paperProfile(rows,linear){
 if(!rows.length)return '';
 return linear?'<dl class="paper-info-linear">'+rows.map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl>':'<table class="paper-info-table" aria-label="个人概览"><tbody>'+rows.map(([k,v])=>'<tr><th scope="row">'+esc(k)+'</th><td>'+esc(v)+'</td></tr>').join('')+'</tbody></table>';
}
renderPreview=function(r=state.resume,experiences=r.items||state.experiences,target='#resumePreview'){
 const t=STUDIO_TEMPLATES.some(x=>x.id===r.template)?r.template:'classic',exps=experiences.filter(e=>e.resumeText?.trim()),info=paperInfoRows(r),linear=r.presentation==='linear';
 const education=r.education?paperSection('教育背景','<p>'+esc(r.education)+'</p>'):'';
 const experience=exps.length?paperSection('实践与项目经历',exps.map(e=>'<article class="paper-exp"><div class="paper-exp-heading"><strong>'+esc(e.title||e.company||'个人经历')+'</strong><small>'+esc(e.period||'')+'</small></div>'+((e.company||e.position)?'<div class="paper-job">'+esc([e.company,e.position].filter(Boolean).join(' / '))+'</div>':'')+paperExperienceCopy(e.resumeText)+'</article>').join('')):'';
 const skills=[['专业技能',r.skills],['证书与语言',r.certificates],['作品与项目链接',r.portfolio]].filter(([,v])=>String(v||'').trim());
 $(target).className='resume-paper '+t+(linear?' linear':'');
 $(target).innerHTML='<header class="paper-header"><div class="paper-identity"><div class="paper-name">'+esc(r.name||'你的姓名')+'</div>'+(r.role?'<div class="paper-target">'+esc(r.role)+'</div>':'')+(r.contact?'<div class="paper-contactline">'+esc(r.contact)+'</div>':'')+'</div></header><div class="paper-body">'+
 paperSection('个人概览',paperProfile(info.rows,linear)+(info.summary?'<p>'+esc(info.summary)+'</p>':''))+
 (r.sectionOrder==='experience'?experience+education:education+experience)+
 paperSection('技能与作品',paperProfile(skills,linear))+
 (r.advantages?.length?paperSection('能力与优势',r.advantages.map(a=>'<article class="paper-exp"><strong>'+esc(a.title)+'</strong><p>'+esc(a.text)+'</p></article>').join('')):'')+'</div>';
};
openResume=function(){for(const [el,key] of [['resumeName','name'],['resumeContact','contact'],['resumeRole','role'],['resumeSummary','summary'],['resumeEducation','education']])$('#'+el).value=state.resume[key]||'';markStudioTemplate();renderResumeItems();renderPreview();if(!editor.open)editor.showModal();};
$('#openResume').onclick=openResume;$('#teaserEdit').onclick=openResume;
$('#loadBasic').onclick=()=>{if(!confirm('将用基础信息档案替换当前草稿的姓名、联系方式和教育背景，是否继续？'))return;for(const key of ['name','contact','education'])state.resume[key]=state.basicProfile[key]||'';save();openResume();toast('已调用基础信息');};
$('#addStudioExperience').onclick=()=>{state.resume.items.push({id:crypto.randomUUID(),title:'',company:'',position:'',period:'',resumeText:''});save();renderResumeItems();};
$('#resumeItems').addEventListener('input',e=>{const field=e.target.dataset.itemField;if(!field)return;const id=e.target.closest('[data-item]').dataset.item;const item=state.resume.items.find(x=>x.id===id);if(item){item[field]=e.target.value;save();renderPreview();}});
$('#resumeItems').addEventListener('click',e=>{const b=e.target.closest('[data-remove-studio]');if(!b)return;state.resume.items=state.resume.items.filter(x=>x.id!==b.dataset.removeStudio);save();renderResumeItems();renderPreview();toast('已从草稿移除；已同步的个人履历仍保留');});
$('#studioAdvantages').oninput=e=>{if(!e.target.hasAttribute('data-strength-copy'))return;const a=state.resume.advantages.find(x=>x.id===e.target.closest('[data-strength]').dataset.strength);if(a){a.text=e.target.value;save();renderPreview();}};
$('#studioAdvantages').onclick=e=>{const b=e.target.closest('[data-remove-strength]');if(b){state.resume.advantages=state.resume.advantages.filter(x=>x.id!==b.dataset.removeStrength);save();renderResumeItems();renderPreview();}};
let resourceType='career';
function openPicker(type){resourceType=type;$('#pickerTitle').textContent=type==='career'?'调用个人履历':'调用已确认优势';$('#pickerHint').textContent=type==='career'?'勾选这次求职需要的经历。已加入的不会重复添加；不同版本简历独立保存。':'只显示你已确认的优势。没有条目时，先到优势资源库确认真实线索。';const items=type==='career'?state.careerHistory:advantageList().filter(a=>a.confirmed);$('#pickerOptions').innerHTML=items.length?items.map(item=>`<label class="picker-item"><input type="checkbox" value="${esc(item.id)}"><span><strong>${esc(item.title)}</strong><small>${esc(type==='career'?[item.company,item.position,item.period].filter(Boolean).join(' · '):item.proof||'尚未填写证据')}</small><p>${esc(type==='career'?item.resumeText:item.story)}</p></span></label>`).join(''):'<p class="module-empty">还没有可调用的记录。先保存个人履历或确认优势。</p>';$('#resourcePicker').showModal();}
$('#loadCareer').onclick=()=>openPicker('career');$('#loadAdvantages').onclick=()=>openPicker('advantages');
$('#applyResources').onclick=()=>{const ids=[...$('#pickerOptions').querySelectorAll('input:checked')].map(x=>x.value);let added=0;for(const id of ids){if(resourceType==='career'){const item=state.careerHistory.find(x=>x.id===id);if(item&&!state.resume.items.some(x=>x.careerId===id)){state.resume.items.push({...structuredClone(item),id:crypto.randomUUID(),careerId:id});added++;}}else{const a=advantageList().find(x=>x.id===id&&x.confirmed);if(a&&!state.resume.advantages.some(x=>x.id===id)){state.resume.advantages.push({id:a.id,title:a.title,text:[a.story,a.proof].filter(Boolean).join('\n')});added++;}}}save();renderResumeItems();renderPreview();$('#resourcePicker').close();toast(`已加入 ${added} 项，重复内容已跳过`);};
function saveStudio(){collectResume();syncCareerFromResume();save();return true;}
$('#saveResumeVersion').onclick=()=>{saveStudio();toast('草稿已保存，经历已同步到个人履历');};
$('#finishStudio').onclick=()=>{collectResume();if(!state.resume.name.trim()){toast('请先填写姓名');$('#resumeName').focus();return;}if(!state.resume.items.some(x=>x.resumeText.trim())&&!state.resume.summary.trim()&&!state.resume.education.trim()&&!state.resume.advantages.length){toast('请至少填写一项教育、经历、简介或已确认优势');return;}saveStudio();$('#completeName').value=$('#versionName').value.trim()||`${state.resume.name} · ${state.resume.role||'个人简历'}`;$('#completeDialog').showModal();};
$('#confirmArchive').onclick=()=>{const snapshot={id:crypto.randomUUID(),name:$('#completeName').value.trim()||`${state.resume.name}的简历`,savedAt:new Date().toISOString(),resume:structuredClone(state.resume),experiences:structuredClone(state.resume.items.filter(x=>x.resumeText.trim()))};state.resumeVersions.unshift(snapshot);save();renderVersions();$('#completeDialog').close();editor.close();enterArchiveRoom('resume');toast('已保存到档案袋');};
$('#skipArchive').onclick=()=>{$('#completeDialog').close();editor.close();toast('草稿与履历已保留，暂未归档');};
$('#printResume').onclick=()=>{saveStudio();renderPreview();window.print();};
editor.addEventListener('close',()=>{saveStudio();});
const routeBeforeStudio=enterArchiveRoom;
enterArchiveRoom=function(room,updateHash=true){routeBeforeStudio(room,updateHash);if(room==='career')renderCareer();};
renderCareer();enterArchiveRoom(location.hash.slice(1)||'home',false);
