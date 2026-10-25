const JOBS = [
  { id: 'product', name: '产品 / 项目' }, { id: 'tech', name: '技术 / 研发' },
  { id: 'data', name: '数据 / 分析' }, { id: 'design', name: '设计 / 创意' },
  { id: 'operations', name: '运营 / 服务' }, { id: 'business', name: '市场 / 商业' },
  { id: 'education', name: '教育 / 公共服务' }, { id: 'other', name: '其他方向' }
];
const QUESTIONS = [
  { id: 'proud', text: '想起一件你确实参与过的事：当时发生了什么？小到一次课程项目、一次值班或帮人解决问题都可以。', hint: '先说事情，不用讲得厉害，也不用想简历怎么写。学习、工作、生活里的真实经历都算。', prompts: ['课程 / 小组项目', '实习 / 兼职 / 工作', '社团 / 志愿 / 公共服务', '竞赛 / 科研 / 个人作品', '帮人解决问题'] },
  { id: 'role', text: '这件事里，你亲手做了什么？', hint: '把“我们做了”拆成“我做了”。没有正式分工也没关系。', prompts: ['我主要负责……', '我主动帮忙……', '我和……一起完成……'] },
  { id: 'steps', text: '选一个动作，具体说说你是怎么做的。', hint: '想到哪一步就说哪一步；先后顺序能让别人看见你的做法。', prompts: ['我先……，接着……', '我用……来整理 / 检查……', '遇到……时，我改成……'] },
  { id: 'challenge', text: '哪里最费心？你当时怎么应对？', hint: '可以是时间紧、信息不全、意见不同。想不到困难的话，说你怎样把事情做完也可以。', prompts: ['一开始卡在……，后来我……', '为了不漏掉……，我……', '没有特别困难，我是这样完成的……'] },
  { id: 'proof', text: '这件事留下了什么看得见的结果或线索？', hint: '想想作品、报告、数据、反馈，或最后交付 / 完成了什么。不记得数字就不写数字。', prompts: ['留下的作品 / 材料是……', '完成或交付了……', '收到的反馈是……', '没有材料，但我能确认……'] },
  { id: 'learning', text: '做完之后，你对自己多知道了什么？', hint: '这只是你的自我观察，能力判断仍会标成待确认。说“不确定”也完全可以。', prompts: ['我发现自己比较喜欢……', '别人常来找我帮忙……', '我最有成就感的是……', '我还不确定'] }
];
function nextQuestion(experience, asked = []) {
  const answered = new Set(asked);
  if (!experience || (!String(experience.proud || '').trim() && !answered.has('proud'))) return QUESTIONS[0];
  return QUESTIONS.slice(1).find(q => !answered.has(q.id) && !String(experience[q.id] || '').trim()) || null;
}
function buildProfile(experiences = [], confirmedSkills = []) {
  const raw = experiences.map(e => [e.title, e.proud, e.role, e.steps, e.challenge, e.proof, e.learning].join(' ')).join(' ');
  const detected = new Set();
  if (/写作|撰写|稿件|文档|报告|校对|润色|排版|编辑/.test(raw)) detected.add('文字表达与编辑');
  if (/沟通|协调|合作|对接|交流/.test(raw)) detected.add('沟通协作');
  if (/计划|排期|跟进|推进|项目|进度|交付/.test(raw)) detected.add('计划与项目推进');
  if (/组织|统筹|安排|活动|分工|执行|落地/.test(raw)) detected.add('组织执行');
  if (/问题|困难|排查|解决|修复|调整|改进|优化|应对/.test(raw)) detected.add('问题解决与改进');
  if (/资料|整理|归纳|研究|文献|数据|统计|调研|分析|实验|表格/.test(raw)) detected.add('信息与数据处理');
  if (/学习|自学|掌握|适应|上手|探索|新知识/.test(raw)) detected.add('学习与适应');
  if (/策划|方案|构思|创意|设计|规划|制作|搭建/.test(raw)) detected.add('创意与方案设计');
  if (/讲解|辅导|教学|培训|授课|指导|帮助/.test(raw)) detected.add('教学与支持');
  const confirmed = new Set(confirmedSkills), all = new Set([...detected, ...confirmed]);
  const needs = experiences.filter(e => !String(e.proof || '').trim() || !String(e.steps || '').trim()).map(e => ({ title: e.title || e.proud || '一段经历', missing: !String(e.steps || '').trim() ? '可以补充你采取的具体行动' : '可以补充作品、反馈或可核实的完成情况' }));
  const emerging = ['文字表达与编辑', '沟通协作', '计划与项目推进', '组织执行', '问题解决与改进', '信息与数据处理', '学习与适应', '创意与方案设计'].filter(s => !all.has(s));
  return { evidenced: [...all], detected: [...detected].filter(s => !confirmed.has(s)), confirmed: [...confirmed], needs, emerging };
}
function mockSuggestions(experiences = [], job = '目标岗位') {
  return experiences.filter(e => e.proud || e.steps || e.role).map(e => {
    const source = String([e.role, e.steps, e.proof].filter(Boolean).join('；') || e.proud).replace(/\s+/g, ' ').trim();
    const s = [e.proud, e.role, e.steps, e.proof].join(' ');
    const skill = /沟通|协调|合作|对接/.test(s) ? '沟通协作（待确认）' : /组织|安排|活动|统筹|推进/.test(s) ? '组织执行（待确认）' : /问题|困难|排查|解决|改进/.test(s) ? '问题解决与改进（待确认）' : /数据|整理|资料|归纳|分析/.test(s) ? '信息整理（待确认）' : /写作|文档|报告|校对|编辑/.test(s) ? '书面表达（待确认）' : '具体能力待确认';
    const parts = [e.role && `承担的部分：${e.role}`, e.steps && `采取的行动：${e.steps}`, e.proof && `可核实的结果或材料：${e.proof}`].filter(Boolean);
    return { experienceId: e.id, source, suggestion: parts.join('；') || source, reason: `围绕「${job}」整理你提供的事实，没有补写未提及的成果或数据。能力判断仍待你确认。`, skill, status: '待确认' };
  }).filter(s => s.suggestion);
}

const KEY = 'wenjian-mvp-v1';
const defaults = { job: 'other', customJob: '', experiences: [], confirmedSkills: [], rejectedSuggestions: [], resume: { name: '', contact: '', role: '', summary: '', education: '', template: 'classic' }, suggestions: [], interview: { current: null, asked: [] } };
let state;
try { state = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { state = structuredClone(defaults); }
if (!JOBS.some(job => job.id === state.job) && !state.customJob) state.job = 'other';
state.resume = { ...defaults.resume, ...state.resume };
state.interview = { ...defaults.interview, ...state.interview };
const $ = s => document.querySelector(s);
let backendMode = location.protocol === 'file:' ? 'mock' : null;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const jobName = () => state.customJob.trim() || JOBS.find(j => j.id === state.job)?.name || '目标岗位';
let toastTimer;
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2400); }
function save() { localStorage.setItem(KEY, JSON.stringify(state)); $('#saveState').textContent = '已保存在本机'; setTimeout(() => $('#saveState').textContent = '自动保存已开启', 1500); renderProfile(); renderExperiences(); renderTeaser(); }
function renderJobs() {
  $('#jobs').innerHTML = JOBS.map(j => `<button class="job-button ${state.job === j.id && !state.customJob ? 'selected' : ''}" data-job="${j.id}"><span>${j.name}</span><i>${state.job === j.id && !state.customJob ? '✓' : '↗'}</i></button>`).join('');
  $('#customJob').value = state.customJob;
}
function renderProfile() {
  const p = buildProfile(state.experiences, state.confirmedSkills);
  $('#evidencedSkills').innerHTML = p.evidenced.length ? [...p.confirmed.map(s => `<button class="skill-tag confirmed" data-skill="${esc(s)}" title="点击取消确认">${esc(s)} <span>✓ 已确认</span></button>`), ...p.detected.map(s => `<button class="skill-tag pending" data-confirm-evidence="${esc(s)}" title="基于经历中的词语识别，点击确认或忽略">${esc(s)} <span>待确认 · ＋</span></button>`)].join('') : '<span class="empty-tag">聊过一段经历后，这里会慢慢出现线索</span>';
  $('#needsEvidence').innerHTML = p.needs.length ? p.needs.map(n => `<p class="need-item"><strong>${esc(n.title)}</strong><span>${esc(n.missing)}</span></p>`).join('') : '<p class="muted-empty">再多一个具体行动或作品细节，简历会更有说服力。</p>';
  $('#emergingSkills').innerHTML = p.emerging.map(s => `<span class="skill-tag explore">${esc(s)}</span>`).join('');
}
function renderExperiences() {
  const list = $('#experienceList');
  if (!state.experiences.length) { list.innerHTML = ''; return; }
  list.innerHTML = `<div class="experience-list-heading">已经聊过的经历 <span>${state.experiences.length}</span></div>` + state.experiences.map(e => `<article class="experience-chip"><div><strong>${esc(e.title || e.proud || '一段经历')}</strong><p>${esc(e.role || e.steps || e.proud || '')}</p></div><button data-delete-exp="${esc(e.id)}" aria-label="删除经历">×</button></article>`).join('');
}
function renderTeaser() { $('#resumeNameTeaser').textContent = state.resume.name ? `${state.resume.name} 的简历` : '一份属于你的简历'; $('#resumeTeaserInfo').textContent = `${state.resume.role || jobName()} · ${state.experiences.length ? `${state.experiences.length} 段真实经历` : '选择方向或直接分享经历，即可开始整理'}`; }
function activeView(name) { for (const id of ['interviewIdle', 'interviewActive', 'interviewDone']) $(`#${id}`).classList.toggle('hidden', id !== name); }
function showQuestion() {
  const exp = state.experiences.find(e => e.id === state.interview.current);
  const q = nextQuestion(exp, state.interview.asked);
  if (!q) { finishInterview(); return; }
  state.interview.question = q.id;
  const n = QUESTIONS.findIndex(x => x.id === q.id) + 1;
  $('#questionNumber').textContent = `一次只聊一件事 · 第 ${n} 题`;
  $('#progressLabel').textContent = `${n} / ${QUESTIONS.length}`;
  $('#progressFill').style.width = `${n / QUESTIONS.length * 100}%`;
  $('#questionText').textContent = q.text;
  $('#questionHint').textContent = q.hint;
  const promptTitle = n === 1 ? '先从一个熟悉的场景想起：' : '点一句开头提示，再用自己的真实情况补完：';
  $('#questionPrompts').innerHTML = `<span>${promptTitle}</span><div>${q.prompts.map(p => `<button type="button" data-prompt="${esc(p)}">${esc(p)}</button>`).join('')}</div>`;
  const selected = $('#selectedMemory');
  if (n === 1 && state.interview.cue) { selected.textContent = `从这个场景开始回忆：${state.interview.cue}`; selected.classList.remove('hidden'); }
  else selected.classList.add('hidden');
  $('#answer').value = state.interview.draft || ''; 
  $('#answer').placeholder = n === 1 ? '比如：有一次……（用你自己的真实情况补完）' : '先写一两句就好，不需要一次说完整。';
  $('#answerCount').textContent = `${$('#answer').value.length} / 1000`; 
  $('#submitAnswer').innerHTML = n === QUESTIONS.length ? '完成这段经历 <span>✓</span>' : '继续 <span>→</span>';
  activeView('interviewActive');
}
function startInterview(cue = '') {
  const exp = { id: crypto.randomUUID(), title: '', proud: '', role: '', steps: '', challenge: '', proof: '', learning: '', resumeText: '' };
  state.experiences.push(exp); state.interview = { current: exp.id, asked: [], cue }; save(); showQuestion(); $('#answer').focus();
}
function finishInterview() {
  const exp = state.experiences.find(e => e.id === state.interview.current);
  if (exp) exp.title = (exp.proud || exp.role || '一段真实经历').slice(0, 32);
  state.interview = { current: null, asked: [], cue: '' }; save(); activeView('interviewDone'); $('#interviewCount').textContent = `${state.experiences.length} 段经历`;
}
function submitAnswer(skip = false) {
  const exp = state.experiences.find(e => e.id === state.interview.current); if (!exp) return;
  const value = $('#answer').value.trim(); const qid = state.interview.question;
  if (!skip && !value) { toast('写下一点想到的内容，或者跳过这个问题。'); return; }
  if (value) exp[qid] = value;
  state.interview.draft = ''; state.interview.asked.push(qid);
  if (qid === 'proud') state.interview.cue = '';
  if (qid === 'proud' && value) exp.title = value.slice(0, 32);
  save(); showQuestion();
}
function renderResumeItems() {
  $('#resumeItems').innerHTML = state.experiences.length ? state.experiences.map(e => {
    const suggestion = state.suggestions.find(s => s.experienceId === e.id && !s.dismissed);
    return `<article class="resume-item"><div class="resume-item-top"><strong>${esc(e.title || '一段经历')}</strong><button class="text-danger" data-delete-exp="${esc(e.id)}">删除</button></div><p class="source-line">你的原始信息 · ${esc([e.role, e.steps, e.proof].filter(Boolean).join('；') || e.proud || '尚未填写')}</p><details class="fact-editor"><summary>编辑这段经历和证据</summary>${[['proud','事情本身'],['role','我的角色'],['steps','采取的行动'],['challenge','遇到的情况'],['proof','证据或完成情况'],['learning','自己的感受']].map(([key,label]) => `<label>${label}<textarea data-fact="${esc(e.id)}" data-fact-key="${key}" rows="2" maxlength="1000">${esc(e[key] || '')}</textarea></label>`).join('')}</details>${suggestion ? `<div class="suggestion-box"><div class="suggestion-label">✦ AI 建议 · ${esc(suggestion.skill)}</div><p>${esc(suggestion.suggestion)}</p><small>${esc(suggestion.reason || '')}</small><div class="suggestion-actions"><button class="primary-button compact" data-accept="${esc(e.id)}">确认采用</button><button class="outline-button compact" data-edit-suggestion="${esc(e.id)}">修改后采用</button><button class="quiet-button compact" data-reject="${esc(e.id)}">拒绝</button></div></div>` : ''}<label class="resume-copy-label">简历表述（由你确认）<textarea data-resume-text="${esc(e.id)}" rows="3" maxlength="500" placeholder="填写你希望放进简历的真实描述${e.resumeText ? '' : '，或先留空'}">${esc(e.resumeText)}</textarea></label></article>`;
  }).join('') : '<div class="empty-resume">目前还没有经历。回到主页聊一件你做过的小事，随时都可以回来。</div>';
}
function renderPreview(r = state.resume, experiences = state.experiences, target = "#resumePreview") {
  const role = r.role || jobName(), exps = experiences.filter(e => e.resumeText);
  const template = r.template === 'editorial' ? 'editorial' : 'classic';
  $(target).className = `resume-paper ${template}`;
  $(target).innerHTML = `<header class="paper-header"><div><div class="paper-name">${esc(r.name || '你的姓名')}</div><div class="paper-role">${esc(role)}</div></div><div class="paper-contact">${esc(r.contact || '联系方式')}</div></header>${r.summary ? `<section class="paper-section"><h3>个人简介</h3><p>${esc(r.summary)}</p></section>` : ''}<section class="paper-section"><h3>求职意向</h3><p>${esc(role)}</p></section>${exps.length ? `<section class="paper-section"><h3>实践经历</h3>${exps.map(e => `<article class="paper-exp"><strong>${esc(e.title || '实践经历')}</strong><p>${esc(e.resumeText)}</p></article>`).join('')}</section>` : ''}${r.education ? `<section class="paper-section"><h3>教育背景</h3><p>${esc(r.education)}</p></section>` : ''}<div class="paper-foot">所有经历与描述均由本人确认</div>`;
}
function openResume() {
  $('#resumeName').value = state.resume.name; $('#resumeContact').value = state.resume.contact; $('#resumeRole').value = state.resume.role || jobName(); $('#resumeSummary').value = state.resume.summary; $('#resumeEducation').value = state.resume.education || '';
  renderResumeItems(); renderPreview(); $('#resumeDialog').showModal();
}
function collectResume() { state.resume.name = $('#resumeName').value; state.resume.contact = $('#resumeContact').value; state.resume.role = $('#resumeRole').value; state.resume.summary = $('#resumeSummary').value; state.resume.education = $('#resumeEducation').value; }
function syncResume() { collectResume(); save(); renderPreview(); }
async function optimize() {
  if (!state.experiences.length) { toast('先聊一段真实经历，再来整理表达。'); return; }
  collectResume(); const button = $('#optimizeBtn'); button.disabled = true; button.textContent = '正在整理…';
  try {
    if (backendMode === null) {
      try { const status = await fetch('/api/status'); backendMode = (await status.json()).mode; }
      catch { backendMode = 'mock'; }
    }
    if (location.protocol === 'file:' || backendMode !== 'ai') {
      const suggestions = mockSuggestions(state.experiences, state.resume.role || jobName());
      for (const s of suggestions) if (!state.rejectedSuggestions.includes(s.experienceId)) state.suggestions = [...state.suggestions.filter(old => old.experienceId !== s.experienceId), s];
      save(); renderResumeItems(); renderPreview(); $('#aiNotice').textContent = '当前站点未连接 AI 服务：建议仅按你提供的事实整理，不会发送经历内容。所有能力判断均待你确认。';
      toast('已整理事实表达建议'); return;
    }
    const res = await fetch('/api/optimize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job: state.resume.role || jobName(), experiences: state.experiences }) });
    const data = await res.json(); if (!res.ok) throw new Error(data.error || '暂时无法优化');
    for (const s of data.suggestions || []) if (!state.rejectedSuggestions.includes(s.experienceId)) state.suggestions = [...state.suggestions.filter(old => old.experienceId !== s.experienceId), s];
    save(); renderResumeItems(); renderPreview(); $('#aiNotice').textContent = data.mode === 'mock' ? '当前站点未连接 AI 服务：建议只整理你提供的事实，不会发送经历内容。' : 'AI 建议依据已填写内容生成，未经你确认不会进入简历。';
    toast(data.mode === 'mock' ? '已整理事实表达建议' : '已生成 AI 改写建议');
  } catch (e) { toast(e.message); } finally { button.disabled = false; button.innerHTML = '✦ 根据真实经历优化'; }
}
function bind() {
  $('#jobs').addEventListener('click', e => { const b = e.target.closest('[data-job]'); if (!b) return; state.job = b.dataset.job; state.customJob = ''; if ($('#resumeRole')) $('#resumeRole').value = JOBS.find(j => j.id === state.job)?.name || ''; save(); renderJobs(); renderTeaser(); });
  $('#customJob').addEventListener('input', e => { state.customJob = e.target.value; save(); renderJobs(); renderTeaser(); });
  $('#startInterview').onclick = () => startInterview(); $('#addExperience').onclick = () => startInterview();
  $('#interviewIdle').addEventListener('click', e => { const b = e.target.closest('[data-start-cue]'); if (b) startInterview(b.dataset.startCue); });
  $('#questionPrompts').addEventListener('click', e => { const b = e.target.closest('[data-prompt]'); if (b) { $('#answer').placeholder = `${b.dataset.prompt}（换成你的真实情况）`; $('#answer').focus(); } });
  $('#submitAnswer').onclick = () => submitAnswer(); $('#skipQuestion').onclick = () => submitAnswer(true);
  $('#answer').addEventListener('input', e => $('#answerCount').textContent = `${e.target.value.length} / 1000`);
  $('#experienceList').addEventListener('click', e => { const b = e.target.closest('[data-delete-exp]'); if (b) removeExperience(b.dataset.deleteExp); });
  $('#evidencedSkills').addEventListener('click', e => { const b = e.target.closest('[data-skill]'); if (b) { state.confirmedSkills = state.confirmedSkills.filter(s => s !== b.dataset.skill); save(); } });
  $('#evidencedSkills').addEventListener('click', e => { const b = e.target.closest('[data-confirm-evidence]'); if (b) { if (!state.confirmedSkills.includes(b.dataset.confirmEvidence)) state.confirmedSkills.push(b.dataset.confirmEvidence); save(); toast('已确认这项能力与你的经历相符'); } });
  $('#openResume').onclick = openResume; $('#teaserEdit').onclick = openResume; $('#optimizeBtn').onclick = optimize;
  for (const id of ['resumeName', 'resumeContact', 'resumeRole', 'resumeSummary', 'resumeEducation']) $(`#${id}`).addEventListener('input', syncResume);
  $('#resumeItems').addEventListener('input', e => { const id = e.target.dataset.resumeText; if (!id) return; const exp = state.experiences.find(x => x.id === id); if (exp) exp.resumeText = e.target.value; collectResume(); save(); renderPreview(); });
  $('#resumeItems').addEventListener('input', e => { const id = e.target.dataset.fact; const key = e.target.dataset.factKey; if (!id || !key) return; const exp = state.experiences.find(x => x.id === id); if (exp) { exp[key] = e.target.value; if (key === 'proud') exp.title = e.target.value.slice(0, 32); save(); } });
  $('#resumeItems').addEventListener('click', e => {
    const accept = e.target.closest('[data-accept]'); const reject = e.target.closest('[data-reject]'); const edit = e.target.closest('[data-edit-suggestion]'); const del = e.target.closest('[data-delete-exp]');
    if (del) { removeExperience(del.dataset.deleteExp); renderResumeItems(); return; }
    if (reject) { const s = state.suggestions.find(x => x.experienceId === reject.dataset.reject); if (s) s.dismissed = true; state.rejectedSuggestions.push(reject.dataset.reject); save(); renderResumeItems(); return; }
    if (accept || edit) { const id = (accept || edit).dataset[accept ? 'accept' : 'editSuggestion']; const s = state.suggestions.find(x => x.experienceId === id); const exp = state.experiences.find(x => x.id === id); if (s && exp) { const text = edit ? window.prompt('修改建议后再加入简历：', s.suggestion) : s.suggestion; if (text === null) return; exp.resumeText = text.trim(); s.dismissed = true; save(); renderResumeItems(); renderPreview(); toast('建议已加入简历，你仍可继续修改'); } }
  });
  document.querySelectorAll('[data-template]').forEach(b => b.onclick = () => { state.resume.template = b.dataset.template; document.querySelectorAll('[data-template]').forEach(x => x.classList.toggle('active', x === b)); save(); renderPreview(); });
  $('#printResume').onclick = () => { syncResume(); window.print(); };
  $('#privacyBtn').onclick = () => $('#privacyDialog').showModal();
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => $(`#${b.dataset.close}`).close());
  $('#clearData').onclick = () => { if (confirm('这会删除本机保存的全部经历和简历内容，且无法恢复。确定清除吗？')) { localStorage.removeItem(KEY); state = structuredClone(defaults); location.reload(); } };
}
function removeExperience(id) { state.experiences = state.experiences.filter(e => e.id !== id); state.suggestions = state.suggestions.filter(s => s.experienceId !== id); save(); renderResumeItems(); renderPreview(); }
async function init() {
  renderJobs(); bind(); renderProfile(); renderExperiences(); renderTeaser(); $('#interviewCount').textContent = state.experiences.length ? `${state.experiences.length} 段经历` : '还没开始';
  if (state.interview.current && state.experiences.some(e => e.id === state.interview.current)) showQuestion(); else activeView(state.experiences.length ? 'interviewDone' : 'interviewIdle');
  document.querySelectorAll('[data-template]').forEach(b => b.classList.toggle('active', b.dataset.template === state.resume.template));
  if (location.protocol === 'file:') { $('#modeBadge').textContent = '✦ 本地模式 · 内容仅在本机'; $('#modeBadge').classList.add('mock'); return; }
  try { const r = await fetch('/api/status'); if (!r.ok) throw new Error('AI 接口未配置'); const d = await r.json(); backendMode = d.mode; $('#modeBadge').textContent = d.mode === 'mock' ? '✦ 本地模式 · 内容仅在本机' : '✦ AI 表达建议已连接'; $('#modeBadge').classList.add(d.mode); } catch { backendMode = 'mock'; $('#modeBadge').textContent = '✦ 分享版 · 本地模式'; $('#modeBadge').classList.add('mock'); }
}
init();

