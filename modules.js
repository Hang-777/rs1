/* Four distinct rooms share facts, but keep their own purpose and records. */
state.advantages = Array.isArray(state.advantages) ? state.advantages : [];
state.resumeVersions = Array.isArray(state.resumeVersions) ? state.resumeVersions : [];
state.actionProgress = state.actionProgress || {};
state.directionReflection = state.directionReflection || {interest:'', preference:''};
const roomInfo = {
  goal:['01 / DIRECTION','下一站去哪里','先探索适合尝试的方向，再把“想变强”拆成具体行动。'],
  resume:['02 / RESUMES','档案袋','把完成的简历存成独立版本。继续修改草稿，不会改变已经归档的简历。'],
  profile:['03 / ADVANTAGES','优势资源库','收藏你的竞争优势，也留下能说明它的具体事例和证据。'],
  interview:['04 / INCUBATOR','灵感孵化器','不急着评价自己。先找到线索，再把它还原成一件真实发生的事。']
};
const workspace = document.querySelector('.workspace');
const goalCard = document.querySelector('.goal-card');
const interviewCard = document.querySelector('.interview-card');
const profileCard = document.querySelector('.profile-card');
const resumeSection = document.querySelector('.resume-section');
const savedStatus = document.querySelector('#saveState');
const side = document.querySelector('.sidebar');
side.innerHTML = '<div class="side-heading">个人档案室</div><nav class="module-nav" aria-label="模块导航">'+Object.entries(roomInfo).map(([key,v])=>`<button data-room="${key}">${v[1]} <span>↗</span></button>`).join('')+'</nav><p class="module-side-note">线索 → 证据 → 优势 → 简历<br>每一步，都由你确认。</p><div class="privacy-mini">资料仅保存在当前浏览器</div>';
workspace.replaceChildren();
const moduleHeading = document.createElement('header'); moduleHeading.className='module-heading';
moduleHeading.innerHTML='<div class="welcome-line"><span id="roomEyebrow"></span></div><h1 id="roomTitle" tabindex="-1"></h1><p id="roomIntro" class="intro"></p>';
moduleHeading.querySelector('.welcome-line').append(savedStatus); workspace.append(moduleHeading);
const panels = {};
Object.keys(roomInfo).forEach(key=>{const p=document.createElement('section');p.className='module-panel';p.id='room-'+key;p.hidden=true;workspace.append(p);panels[key]=p;});
panels.goal.innerHTML=`<section class="module-card"><span class="eyebrow">还没有方向？先认识自己的偏好</span><h2>你更愿意把时间花在哪里？</h2><div class="form-grid"><label>最想尝试的事情<select id="directionInterest"><option value="">先选一个接近的</option><option value="people">理解别人、协调和提供帮助</option><option value="making">把一个想法做成作品或产品</option><option value="analysis">研究信息、找规律、解决问题</option><option value="expression">写作、表达、讲故事</option></select></label><label>你希望怎样开始？<select id="directionPreference"><option value="">暂时不确定</option><option value="solo">先独立做一个小作品</option><option value="team">找人合作完成一个小项目</option></select></label></div><div id="directionSuggestions" class="direction-suggestions"></div></section>`;
panels.goal.append(goalCard);
const plan=document.createElement('section');plan.className='module-card';plan.innerHTML='<span class="eyebrow">把方向变成行动</span><h2 id="planTitle"></h2><p class="section-desc">以下是可选练习，不是岗位录用标准。请结合实际招聘要求调整；勾选完成不会自动认定你具备某项能力。</p><div id="directionPlan"></div>';panels.goal.append(plan);
panels.interview.innerHTML=`<section class="module-card incubator-intro"><span class="eyebrow">换个角度，看见自己</span><h2>“这也算优势吗？”先别急着否定。</h2><p>选一个让你想到具体事情的入口。不用想一个好听的能力词，我们会继续问你做了什么、怎么做、留下了什么。</p><div class="incubator-triggers"><button data-seed="帮忙">别人总来找你帮什么忙？<small>讲解、修东西、整理、拿主意……</small></button><button data-seed="习惯">有什么事你做起来很顺手？<small>别人觉得麻烦，你却有自己的方法。</small></button><button data-seed="兴趣">哪件事你会自己反复琢磨？<small>一个作品、一项兴趣、一种工具。</small></button><button data-seed="困难">你最近克服过什么小困难？<small>从不熟悉到能完成，中间发生了什么？</small></button></div></section>`;
panels.interview.append(interviewCard);
$('#interviewDone p').textContent='经历已经保存。去优势资源库查看待确认的能力线索，或继续孵化另一件事。';
const toLibrary=document.createElement('button');toLibrary.className='primary-button';toLibrary.dataset.room='profile';toLibrary.textContent='查看优势资源库 →';$('#interviewDone').append(toLibrary);
profileCard.querySelector('h2').textContent='自动发现的能力线索';
const details=document.createElement('details');details.className='module-card';details.innerHTML='<summary>查看能力概览与待补充线索</summary>';details.append(profileCard);
panels.profile.innerHTML=`<div class="module-tools"><label>查找优势<input id="advantageSearch" type="search" placeholder="搜索能力、经历或证据"></label><label>状态<select id="advantageFilter"><option value="all">全部</option><option value="confirmed">已确认</option><option value="pending">待确认</option><option value="evidence">需补充证据</option></select></label><button class="primary-button" id="addAdvantage">＋ 手动存一项优势</button></div><p class="section-desc">自动线索来自你填写的经历，仅供你判断。每张卡片都可以补充、确认或忽略。</p><div id="advantageRecords" class="record-grid"></div>`;
panels.profile.append(details);
resumeSection.querySelector('h2').textContent='当前编辑中的简历草稿';
panels.resume.append(resumeSection);
const versions=document.createElement('section');versions.className='module-card';versions.innerHTML='<span class="eyebrow">已完成的简历</span><h2>你的简历版本</h2><p class="section-desc">在编辑器中点击“保存到档案袋”，即可保留一个独立版本。保存在本机，不会上传或跨设备同步。</p><div id="resumeVersions" class="record-grid"></div>';panels.resume.append(versions);
const dialogMarkup=`<dialog id="advantageDialog" class="small-dialog"><form id="advantageForm"><div class="dialog-head"><h2>保存一项竞争优势</h2><button type="button" class="icon-button" data-close="advantageDialog" aria-label="关闭">×</button></div><label>优势名称<input id="advantageTitle" required maxlength="60" placeholder="例如：能把复杂事情讲清楚"></label><label>具体事例<textarea id="advantageStory" required maxlength="1500" rows="4" placeholder="什么情境下，你具体做了什么？"></textarea></label><label>证据或可核实的结果<textarea id="advantageProof" maxlength="1000" rows="3" placeholder="作品、记录、反馈，或能确认的完成情况；没有可留空"></textarea></label><label class="check-label"><input type="checkbox" id="advantageConfirmed">我确认这项能力描述符合真实情况</label><p class="section-desc">确认代表你的自我判断，不代表平台验证；没有证据的条目仍标记需补充。</p><button class="primary-button" type="submit">保存优势</button></form></dialog><dialog id="savedResumeDialog" class="resume-dialog saved-resume-dialog"><div class="dialog-head"><h2 id="savedVersionTitle"></h2><button class="icon-button" data-close="savedResumeDialog" aria-label="关闭">×</button></div><div class="resume-toolbar"><span>已归档版本 · 独立于当前草稿</span><button class="primary-button" id="printSavedResume">导出此版本 PDF ↓</button></div><div class="preview-wrap"><div id="savedResumePreview" class="resume-paper"></div></div></dialog>`;
document.body.insertAdjacentHTML('beforeend',dialogMarkup);
for(const el of document.querySelectorAll('#advantageDialog [data-close],#savedResumeDialog [data-close]'))el.onclick=()=>$('#'+el.dataset.close).close();
const PLANS={
 product:[['拆解一个常用产品','选一个功能，写出目标用户、使用场景、问题与改进方案。','一页需求说明和简单原型'],['推进一个小项目','列任务、约定分工、跟进交付，记录你实际协调的部分。','任务清单、进度记录和复盘']],
 tech:[['做一个小工具','选择一个自己遇到的小问题，做出能运行的解决方案。','代码、使用说明和演示'],['记录一次排查','复现一个问题，记录尝试过的思路与最终处理方式。','排查记录与前后对比']],
 data:[['分析一份公开数据','确定一个具体问题，清理数据并做出图表，标明来源与局限。','分析报告、图表与处理过程'],['练习解释结论','用一页说明你发现了什么，以及哪些结论不能从数据中得出。','结论摘要与口头讲解记录']],
 design:[['完成一个小设计任务','为一个明确场景提出方案，保留草图与选择理由。','过程稿、成品与设计说明'],['征求真实反馈','请使用者试用并记录反馈，再针对问题修改。','反馈记录与迭代对比']],
 operations:[['组织一次小活动','明确参与者、目标、执行安排，记录自己承担的任务。','活动方案、执行记录与复盘'],['改进一个服务流程','观察一个重复出现的问题，提出可执行改进并记录反馈。','流程图与改进记录']],
 business:[['研究一个真实需求','通过公开资料或征得同意的访谈了解一类用户的问题。','需求摘要、资料来源与假设'],['练习清晰提案','围绕一个需求写方案，说明价值、限制和所需资源。','一页提案与真实反馈']],
 education:[['准备一段讲解','选一个熟悉的知识点，面向明确对象制作材料。','讲解提纲、课件或演示'],['观察理解效果','请对方尝试复述或完成练习，记录真实反馈并调整。','练习材料与改进记录']],
 other:[['读懂目标岗位','收集几个感兴趣的真实岗位描述，区分职责、要求和自己待了解的内容。','岗位对照表与待探索问题'],['做一个低成本尝试','选择最感兴趣的一项任务，完成一个小作品或一次真实协作。','过程记录、交付物与复盘']]
};
function renderDirection(){
 const interest=state.directionReflection.interest;
 const ids={people:['operations','education','business'],making:['design','tech','product'],analysis:['data','tech','product'],expression:['business','education','operations']}[interest]||[];
 $('#directionSuggestions').innerHTML=ids.length?'<p>这些方向可以作为探索起点，不是能力测评结果：</p>'+ids.map(id=>`<button class="outline-button" data-direction="${id}">${JOBS.find(x=>x.id===id).name} ↗</button>`).join(''):'<p>不确定也没关系，可以直接在下面选一个方向试试。</p>';
 $('#planTitle').textContent=jobName()+' · 可以从这些事开始';
 const key=state.customJob?'other':state.job;
 const context=state.directionReflection.preference==='team'?'可以邀请一位同伴合作，但单独记录自己的贡献。':state.directionReflection.preference==='solo'?'先缩小范围，做成一个能独立完成的版本。':'先选一项与你当前条件匹配的练习。';
 $('#directionPlan').innerHTML='<p class="section-desc">'+context+(state.customJob?' 自定义岗位暂用通用探索计划，请结合实际岗位要求调整。':'')+'</p>'+ (PLANS[key]||PLANS.other).map(([title,action,proof],i)=>{const id=key+':'+state.customJob+':'+i;return `<article class="action-card"><label class="check-label"><input type="checkbox" data-action="${esc(id)}" ${state.actionProgress[id]?'checked':''}><strong>${title}</strong></label><p>${action}</p><small>建议留下：${proof}</small><button class="quiet-button" data-room="interview">做过类似的事？去孵化优势 →</button></article>`;}).join('');
}
function derivedAdvantages(){
 return state.experiences.flatMap(e=>buildProfile([e],[]).detected.map(title=>({id:'derived:'+e.id+':'+title,title,story:[e.proud,e.role,e.steps].filter(Boolean).join('；'),proof:e.proof||'',confirmed:false,sourceId:e.id,derived:true}))).filter(a=>!state.advantages.some(x=>x.id===a.id));
}
function advantageList(){return [...state.advantages.filter(a=>!a.dismissed),...derivedAdvantages()];}
function renderAdvantages(){
 const query=$('#advantageSearch').value.trim().toLowerCase(),filter=$('#advantageFilter').value;
 const entries=advantageList().filter(a=>(a.title+' '+a.story+' '+a.proof).toLowerCase().includes(query)).filter(a=>filter==='all'||filter==='confirmed'&&a.confirmed||filter==='pending'&&!a.confirmed||filter==='evidence'&&!a.proof.trim());
 $('#advantageRecords').innerHTML=entries.length?entries.map(a=>`<article class="module-record"><span class="record-status">${a.confirmed?'本人已确认':'能力判断 · 待确认'}${a.proof.trim()?' · 已填写证据':' · 需补充证据'}</span><h3>${esc(a.title)}</h3><p>${esc(a.story)}</p><div class="evidence-note"><strong>证据 / 结果</strong><p>${esc(a.proof||'还没有具体证据，可以稍后补充。')}</p></div><small>${a.sourceId?'来源：灵感孵化器中的真实经历':'来源：手动记录'}</small><div class="record-actions"><button class="outline-button" data-edit-advantage="${esc(a.id)}">${a.confirmed?'查看 / 修改':'补充 / 确认'}</button><button class="quiet-button" data-dismiss-advantage="${esc(a.id)}">忽略</button></div></article>`).join(''):'<div class="module-empty"><h3>这里等待你的一条真实优势。</h3><p>换个筛选条件，或从灵感孵化器聊一件小事。也可以直接手动存档。</p><button class="outline-button" data-room="interview">去孵化灵感 →</button></div>';
}
let editingAdvantage=null;
function editAdvantage(id){editingAdvantage=advantageList().find(a=>a.id===id)||null;$('#advantageTitle').value=editingAdvantage?.title||'';$('#advantageStory').value=editingAdvantage?.story||'';$('#advantageProof').value=editingAdvantage?.proof||'';$('#advantageConfirmed').checked=editingAdvantage?.confirmed||false;$('#advantageDialog').showModal();}
$('#addAdvantage').onclick=()=>editAdvantage(null);
$('#advantageForm').onsubmit=event=>{event.preventDefault();const title=$('#advantageTitle').value.trim(),story=$('#advantageStory').value.trim();if(!title||!story){toast('请写下优势名称与一件具体事例。');return;}const item={id:editingAdvantage?.id||crypto.randomUUID(),sourceId:editingAdvantage?.sourceId||null,title,story,proof:$('#advantageProof').value.trim(),confirmed:$('#advantageConfirmed').checked,updatedAt:new Date().toISOString()};state.advantages=state.advantages.filter(a=>a.id!==item.id);state.advantages.push(item);save();renderAdvantages();$('#advantageDialog').close();toast('已保存到优势资源库');};
$('#advantageSearch').oninput=renderAdvantages;$('#advantageFilter').onchange=renderAdvantages;
$('#advantageRecords').onclick=event=>{const edit=event.target.closest('[data-edit-advantage]'),dismiss=event.target.closest('[data-dismiss-advantage]');if(edit)editAdvantage(edit.dataset.editAdvantage);if(dismiss){const a=advantageList().find(x=>x.id===dismiss.dataset.dismissAdvantage);if(a){state.advantages=state.advantages.filter(x=>x.id!==a.id);state.advantages.push({...a,dismissed:true});save();renderAdvantages();$('#restoreAdvantages').hidden=false;}}};
const restore=document.createElement('button');restore.id='restoreAdvantages';restore.className='quiet-button';restore.textContent='恢复已忽略的优势';restore.hidden=!state.advantages.some(x=>x.dismissed);restore.onclick=()=>{state.advantages.forEach(a=>a.dismissed=false);save();renderAdvantages();restore.hidden=true;};panels.profile.append(restore);
function renderVersions(){
 $('#resumeVersions').innerHTML=state.resumeVersions.length?state.resumeVersions.map(v=>`<article class="module-record"><span class="record-status">已归档 · ${esc(new Date(v.savedAt).toLocaleDateString('zh-CN'))}</span><h3>${esc(v.name)}</h3><p>${esc(v.resume.role||'未填写求职方向')}</p><small>${v.experiences.length} 段已确认表述 · ${v.resume.template==='editorial'?'作品导向':'简洁经典'}</small><div class="record-actions"><button class="primary-button" data-view-version="${esc(v.id)}">查看 / 导出</button><button class="quiet-button" data-rename-version="${esc(v.id)}">重命名</button></div></article>`).join(''):'<div class="module-empty"><h3>你的第一份简历，还在路上。</h3><p>打开上方草稿，整理并确认内容，然后点击“保存到档案袋”。</p></div>';
}
$('#saveResumeVersion').onclick=()=>{collectResume();const exps=state.experiences.filter(e=>e.resumeText.trim());if(!state.resume.name.trim()||(!exps.length&&!state.resume.summary.trim()&&!state.resume.education.trim())){toast('请至少填写姓名，以及简介、教育背景或一段已确认的经历。');return;}const name=$('#versionName').value.trim()||`${state.resume.name} · ${state.resume.role||jobName()}`;state.resumeVersions.unshift({id:crypto.randomUUID(),name,savedAt:new Date().toISOString(),resume:structuredClone({...state.resume,role:state.resume.role||jobName()}),experiences:structuredClone(exps)});save();renderVersions();toast('已保存独立版本，可在档案袋查看');};
$('#resumeVersions').onclick=event=>{const view=event.target.closest('[data-view-version]'),rename=event.target.closest('[data-rename-version]');const id=view?.dataset.viewVersion||rename?.dataset.renameVersion;if(!id)return;const v=state.resumeVersions.find(x=>x.id===id);if(!v)return;if(rename){const name=prompt('修改简历版本名称',v.name);if(name?.trim()){v.name=name.trim().slice(0,60);save();renderVersions();}return;}$('#savedVersionTitle').textContent=v.name;renderPreview(v.resume,v.experiences,'#savedResumePreview');$('#savedResumeDialog').showModal();};
$('#printSavedResume').onclick=()=>{document.body.classList.add('printing-saved');window.print();};
window.addEventListener('afterprint',()=>document.body.classList.remove('printing-saved'));
$('#savedResumeDialog').addEventListener('close',()=>document.body.classList.remove('printing-saved'));
$('#directionInterest').value=state.directionReflection.interest;$('#directionPreference').value=state.directionReflection.preference;
for(const [id,key] of [['directionInterest','interest'],['directionPreference','preference']])$('#'+id).onchange=e=>{state.directionReflection[key]=e.target.value;save();renderDirection();};
$('#directionSuggestions').onclick=e=>{const b=e.target.closest('[data-direction]');if(!b)return;state.job=b.dataset.direction;state.customJob='';save();renderJobs();renderDirection();};
$('#jobs').addEventListener('click',renderDirection);$('#customJob').addEventListener('input',renderDirection);
$('#directionPlan').onchange=e=>{if(e.target.dataset.action){state.actionProgress[e.target.dataset.action]=e.target.checked;save();}};
$('#answer').addEventListener('input',()=>{state.interview.draft=$('#answer').value;save();});
const seedQuestions={帮忙:'最近一次别人来找你帮忙，是为了什么？你当时做了哪件事？',习惯:'说一件你做起来顺手、别人却觉得麻烦的事。最近一次是什么时候？',兴趣:'最近你主动花时间琢磨或做了什么？讲一次具体的尝试。',困难:'想一次从“不会”到“做到了”的小事。你最开始遇到了什么？'};
panels.interview.addEventListener('click',e=>{const seed=e.target.closest('[data-seed]');if(!seed)return;if(state.interview.current){toast('你有一段正在进行的访谈，可以先继续完成或跳过剩余问题。');$('#answer').focus();return;}startInterview(seed.dataset.seed);$('#questionText').textContent=seedQuestions[seed.dataset.seed];$('#answer').focus();});
const originalShowQuestion=showQuestion;
showQuestion=function(){originalShowQuestion();if(state.interview.question==='proud'&&seedQuestions[state.interview.cue])$('#questionText').textContent=seedQuestions[state.interview.cue];};
function enterArchiveRoom(room,updateHash=true){
 if(room!=='home'&&!roomInfo[room])room='home';
 if(updateHash&&location.hash!=='#'+room){location.hash=room;return;}
 document.body.classList.toggle('archive-home',room==='home');
 Object.entries(panels).forEach(([key,panel])=>panel.hidden=key!==room);
 document.querySelectorAll('.module-nav [data-room]').forEach(b=>{b.classList.toggle('selected',b.dataset.room===room);if(b.dataset.room===room)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 if(room!=='home'){const [eyebrow,title,intro]=roomInfo[room];$('#roomEyebrow').textContent=eyebrow;$('#roomTitle').textContent=title;$('#roomIntro').textContent=intro;if(room==='goal')renderDirection();if(room==='profile')renderAdvantages();if(room==='resume')renderVersions();$('#roomTitle').focus({preventScroll:true});}
 window.scrollTo(0,0);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-room]');if(b){e.preventDefault();enterArchiveRoom(b.dataset.room);}});
document.querySelector('.brand').onclick=e=>{e.preventDefault();enterArchiveRoom('home');};
window.addEventListener('hashchange',()=>enterArchiveRoom(location.hash.slice(1),false));
enterArchiveRoom(location.hash.slice(1)||'home',false);
