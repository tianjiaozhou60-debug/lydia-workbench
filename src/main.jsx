import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, ArrowLeft, ArrowRight, BarChart3, Bell, BookOpen, Bot, BriefcaseBusiness, CalendarDays,
  Check, CheckSquare, ChevronDown, CircleUserRound, Cloud, Database, Download,
  ExternalLink, FileSpreadsheet, FileText, Filter, Globe2, GraduationCap, Home, Languages,
  Mail, Menu, MessageSquareText, Mic2, MoreHorizontal, Newspaper,
  PackageSearch, PanelLeftClose, PenLine, Plus, Search, Send, Settings, Share2,
  Sparkles, Target, Trash2, Upload, UsersRound, X
} from 'lucide-react';
import './styles.css';
import './ielts-bank.css';
import './ielts-learning.css';
import { contextParagraphs, ieltsSubjects, ieltsVocabulary } from './ielts-content.js';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(registration => registration.update()).catch(() => {});
  });
}

const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const seededTasks = [
  { id: '2026-09-01-00240-booking', date: '2026-09-01', time: '完成', title: '00240 Rindab：订舱函已发给阿婷，按客户指定货代推进', lane: 'sales', done: true },
  { id: '2026-09-01-12471-booking', date: '2026-09-01', time: '完成', title: '12471 T.A.T. Parts：订舱函已发给阿婷', lane: 'sales', done: true },
  { id: '2026-09-01-12471-contact', date: '2026-09-01', time: '完成', title: '12471：已更新联系人和电话，并回复预计9月25日完成', lane: 'sales', done: true },
  { id: '2026-09-02-00240-city-replied', date: '2026-09-02', time: '完成', title: '00240 Rindab：Fracht已询问从哪个城市发货，已回复广州发货', lane: 'sales', done: true },
  { id: '2026-09-02-00240-agent-wait', date: '2026-09-02', time: '等待中', title: '00240 Rindab：等待Fracht发送中国货代的联系人、邮箱、电话和地址', lane: 'sales', done: false },
  { id: '2026-09-02-00240-quote', date: '2026-09-02', time: '收到后', title: '00240：将中国货代资料转给阿婷，跟进FOB广州本地费用报价', lane: 'sales', done: false },
  { id: '2026-09-02-00240-pi', date: '2026-09-02', time: '报价后', title: '00240：确认费用、更新PI并发给客户安排付款', lane: 'sales', done: false },
  { id: '2026-09-02-12471-forwarder-email', date: '2026-09-02', time: '已确认', title: '12471 T.A.T. Parts：目前只有一个货代邮箱，货代资料不完整', lane: 'sales', done: true },
  { id: '2026-09-02-12471-forwarder-wait', date: '2026-09-02', time: '等待中', title: '12471 T.A.T. Parts：等待客户补充完整货代信息（公司、联系人、电话、邮箱和地址）', lane: 'sales', done: false },
  { id: '2026-09-02-12471-forwarder-next', date: '2026-09-02', time: '收到后', title: '12471 T.A.T. Parts：收到完整货代资料后转给阿婷并继续订舱', lane: 'sales', done: false }
];

const retiredSeedTaskIds = new Set([
  '2026-09-02-00240-agent',
  '2026-09-02-12471-agent',
  '2026-09-02-12471-booking'
]);

const mergeSeededTasks = (stored = []) => {
  const customTasks = stored.filter(task => (!Number.isInteger(task.id) || task.id > 8) && !retiredSeedTaskIds.has(task.id));
  const byId = new Map(customTasks.map(task => [task.id, task]));
  seededTasks.forEach(task => {
    if (!byId.has(task.id)) byId.set(task.id, task);
  });
  return Array.from(byId.values());
};

const initialLeads = [
  { company: 'TEVOR Sp. z o.o.', country: '波兰', type: '救援车辆制造商', contact: 'Export Manager', status: '待开发', next: '发送HML-18448场景方案', priority: 'A' },
  { company: 'Roger Dyson Group', country: '英国', type: '救援车辆制造商', contact: 'Haris Naeem', status: '待开发', next: '采购负责人定向触达', priority: 'A' },
  { company: 'Contorion GmbH', country: '德国', type: '专业工具B2B电商', contact: 'Matt Breier', status: '待开发', next: '请求转交照明品类经理', priority: 'A' },
  { company: 'Proffsmagasinet', country: '瑞典', type: '专业工具电商', contact: 'Amanda Ekbäck', status: '已找到决策人', next: 'LinkedIn连接+产品资料', priority: 'A' },
  { company: 'Power Tool World', country: '英国', type: '工具经销商', contact: 'Dave Prime', status: '已找到决策人', next: '发送采购定向开发信', priority: 'A' },
  { company: 'Klium N.V.', country: '比利时', type: '专业工具电商', contact: '待确认', status: '研究中', next: '查找Lighting Category', priority: 'B' }
];

const intel = [
  { time: '2小时前', title: '欧盟车辆照明法规与认证动态', source: 'UNECE / EU', impact: '关注', tone: 'good' },
  { time: '5小时前', title: '欧洲道路救援装备渠道更新', source: '行业协会', impact: '机会', tone: 'good' },
  { time: '昨天', title: '专业工具渠道增加多电池平台产品', source: '渠道监测', impact: '中性', tone: 'neutral' },
  { time: '2天前', title: '海外社媒短视频内容趋势变化', source: '平台动态', impact: '行动', tone: 'warn' }
];

const navGroups = [
  { label: '工作台', items: [
    ['today', '今日工作台', Home], ['crm', '客户管理 CRM', UsersRound], ['intel', '行业情报', Newspaper], ['excel', 'Excel 数据中心', FileSpreadsheet]
  ]},
  { label: '学习中心', items: [
    ['ielts', '雅思 6.5 计划', GraduationCap], ['ielts-bank', '雅思真题练习', CheckSquare], ['terms', 'LED 后装术语', Languages], ['writing', '写作与邮件批改', PenLine]
  ]},
  { label: '社媒中心', items: [
    ['social', '内容工作台', Share2], ['linkedin', 'LinkedIn 运营', Send], ['calendar', '内容日历', CalendarDays]
  ]}
];

const laneMeta = {
  sales: { label: '外贸跟进', color: '#c9141d' },
  ielts: { label: '雅思训练', color: '#177245' },
  social: { label: '社媒发布', color: '#b36500' }
};

const readStorage = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Embedded browsers may block local storage. The app should remain usable in memory.
  }
};

function usePersistedState(key, fallback) {
  const [value, setValue] = useState(() => readStorage(key, fallback));
  useEffect(() => writeStorage(key, value), [key, value]);
  return [value, setValue];
}

function useTaskState() {
  const [tasks, setTasks] = useState(() => {
    const current = readStorage('lydia.tasks.v2', null);
    const legacy = readStorage('lydia.tasks', null);
    const stored = current ?? legacy;
    return mergeSeededTasks(Array.isArray(stored) ? stored : []);
  });
  useEffect(() => writeStorage('lydia.tasks.v2', tasks), [tasks]);
  return [tasks, setTasks];
}

function App() {
  const [page, setPage] = useState('today');
  const [tasks, setTasks] = useTaskState();
  const [leads, setLeads] = usePersistedState('lydia.leads', initialLeads);
  const [notes, setNotes] = usePersistedState('lydia.notes', []);
  const [lane, setLane] = useState('sales');
  const [query, setQuery] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const toggleTask = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const doneCount = tasks.filter(t => t.done).length;
  const percent = Math.round((doneCount / tasks.length) * 100);

  const addQuick = (text) => {
    if (!text.trim()) return;
    const item = { id: Date.now(), date: localDateKey(), time: '待安排', title: text.trim(), lane, done: false };
    setTasks([...tasks, item]);
    setNotes([{ id: item.id, text: text.trim(), createdAt: new Date().toISOString() }, ...notes]);
    showToast('已加入今日计划');
  };

  const exportCsv = () => {
    const rows = [
      ['公司', '国家', '客户类型', '联系人', '状态', '下一步', '优先级'],
      ...leads.map(lead => [lead.company, lead.country, lead.type, lead.contact, lead.status, lead.next, lead.priority])
    ];
    const csv = '\ufeff' + rows.map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = `Lydia_CRM_${new Date().toISOString().slice(0, 10)}.csv`; link.click();
    URL.revokeObjectURL(url);
    showToast('CRM 已导出，可用 Excel 打开');
  };

  const titles = { today: '今日工作台', crm: '客户管理 CRM', intel: 'LED 行业情报', excel: 'Excel 数据中心', ielts: '雅思 6.5 计划', 'ielts-bank': '雅思真题练习', terms: 'LED 后装术语', writing: '写作与邮件批改', social: '社媒内容工作台', linkedin: 'LinkedIn 运营', calendar: '内容日历' };

  return <div className="app-shell">
    <Sidebar page={page} setPage={setPage} open={mobileMenu} close={() => setMobileMenu(false)} />
    <main className="main-shell">
      <Topbar title={titles[page] || 'Lydia Workbench'} query={query} setQuery={setQuery} openMenu={() => setMobileMenu(true)} showToast={showToast} />
      <div className="page-wrap">
        {page === 'today' && <Dashboard tasks={tasks} toggleTask={toggleTask} doneCount={doneCount} percent={percent} lane={lane} setLane={setLane} addQuick={addQuick} setPage={setPage} />}
        {page === 'crm' && <Crm leads={leads} setLeads={setLeads} query={query} exportCsv={exportCsv} showToast={showToast} />}
        {page === 'ielts' && <Ielts showToast={showToast} openQuestionBank={() => setPage('ielts-bank')} />}
        {page === 'ielts-bank' && <IeltsBank showToast={showToast} />}
        {['social', 'linkedin', 'calendar'].includes(page) && <Social showToast={showToast} />}
        {page === 'intel' && <Intel showToast={showToast} />}
        {page === 'excel' && <ExcelCenter leads={leads} exportCsv={exportCsv} showToast={showToast} />}
        {['terms', 'writing'].includes(page) && <WritingLab mode={page} showToast={showToast} />}
      </div>
    </main>
    <MobileNav page={page} setPage={setPage} openMore={() => setMobileMenu(true)} />
    {toast && <div className="toast"><Check size={16} />{toast}</div>}
  </div>;
}

function Sidebar({ page, setPage, open, close }) {
  const go = (id) => { setPage(id); close(); };
  return <>
    <div className={`mobile-scrim ${open ? 'show' : ''}`} onClick={close} />
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark">LW</div><div><strong>Lydia Workbench</strong><span>汽车LED外贸 · 雅思 · 社媒</span></div><button className="mobile-close" onClick={close}><X /></button></div>
      <nav>
        {navGroups.map(group => <div className="nav-group" key={group.label}>
          <div className="nav-label">{group.label}</div>
          {group.items.map(([id, label, Icon]) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => go(id)}><Icon size={18}/><span>{label}</span></button>)}
        </div>)}
      </nav>
      <button className="settings-row"><Settings size={18}/><span>设置与同步</span></button>
    </aside>
  </>;
}

function Topbar({ title, query, setQuery, openMenu, showToast }) {
  return <header className="topbar">
    <button className="menu-btn" onClick={openMenu}><Menu /></button>
    <div className="mobile-title">{title}</div>
    <label className="global-search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索客户、产品、任务或文件"/><kbd>Ctrl K</kbd></label>
    <div className="top-actions">
      <div className="date-control"><CalendarDays size={17}/><span>{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}</span></div>
      <button className="sync-control" onClick={() => showToast('本机数据已保存；云同步待配置')}><Cloud size={17}/><span>本机已保存</span></button>
      <button className="icon-btn" title="通知"><Bell size={19}/></button>
      <button className="profile"><CircleUserRound size={25}/><span>Lydia</span><ChevronDown size={14}/></button>
    </div>
  </header>;
}

function Dashboard({ tasks, toggleTask, doneCount, percent, lane, setLane, addQuick, setPage }) {
  const [capture, setCapture] = useState('');
  const laneTasks = tasks.filter(t => t.lane === lane && !t.done);
  const submit = () => { addQuick(capture); setCapture(''); };
  const today = localDateKey();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = localDateKey(tomorrowDate);
  const taskSections = [
    { id: 'today', label: '今日记录与待办', date: today, tasks: tasks.filter(task => task.date === today) },
    { id: 'tomorrow', label: '明日待办', date: tomorrow, tasks: tasks.filter(task => task.date === tomorrow) },
    { id: 'overdue', label: '待继续处理', date: '', tasks: tasks.filter(task => task.date && task.date < today && !task.done) },
    { id: 'history', label: '近期完成', date: '', tasks: tasks.filter(task => task.date && task.date < today && task.done) },
    { id: 'other', label: '其他计划', date: '', tasks: tasks.filter(task => !task.date) }
  ].filter(section => section.tasks.length);
  return <>
    <PageHead title="今日工作台" subtitle="把客户推进、英语训练和个人品牌做成每天可完成的动作" />
    <section className="progress-strip">
      <Metric label="业务跟进" value={`${tasks.filter(t => t.lane === 'sales' && t.done).length} / ${tasks.filter(t => t.lane === 'sales').length}`} pct={46}/>
      <Metric label="雅思训练" value="45 / 90 分钟" pct={50}/>
      <Metric label="社媒发布" value="1 / 3 项" pct={33}/>
      <Metric label="每日目标" value={`${percent}%`} pct={percent}/>
    </section>
    <div className="dashboard-grid">
      <section className="panel day-plan">
        <div className="panel-title"><div><CheckSquare size={19}/>工作记录与下一步</div><span>已完成 {doneCount} / {tasks.length}</span></div>
        <div className="task-list">{taskSections.map(section => <div className="task-section" key={section.id}>
          <div className="task-section-title"><strong>{section.label}</strong>{section.date && <span>{section.date.slice(5).replace('-', '月')}日</span>}</div>
          {section.tasks.map(task => <label className={`task-row ${task.done ? 'done' : ''}`} key={task.id}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)}/><span className="custom-check">{task.done && <Check size={14}/>}</span><time>{task.time}</time><span>{task.title}</span></label>)}
        </div>)}</div>
      </section>
      <section className="panel focus-panel">
        <div className="lane-tabs">{Object.entries(laneMeta).map(([id, meta]) => <button style={{'--lane': meta.color}} className={lane === id ? 'active' : ''} onClick={() => setLane(id)} key={id}>{meta.label}<span>{tasks.filter(t => t.lane === id && !t.done).length}</span></button>)}</div>
        <ol className="focus-list">{laneTasks.map((task, index) => <li key={task.id}><span className="rank">{index + 1}</span><span>{task.title}</span><time>{task.time}</time></li>)}</ol>
        <button className="text-action" onClick={() => setPage(lane === 'sales' ? 'crm' : lane === 'ielts' ? 'ielts' : 'social')}>进入该模块 <span>→</span></button>
      </section>
    </div>
    <section className="panel intel-panel">
      <div className="panel-title"><div><Newspaper size={19}/>LED 行业情报</div><button className="text-action" onClick={() => setPage('intel')}>更多 →</button></div>
      <div className="intel-table"><div className="intel-head"><span>时间</span><span>标题</span><span>来源</span><span>判断</span></div>{intel.map((item, i) => <div className="intel-row" key={i}><span>{item.time}</span><strong>{item.title}</strong><span>{item.source}</span><span className={`impact ${item.tone}`}>{item.impact}</span></div>)}</div>
    </section>
    <section className="quick-capture"><PenLine size={18}/><input value={capture} onChange={e => setCapture(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder={`记录${laneMeta[lane].label}的待办、灵感或下一步行动`}/><button className="icon-btn" title="添加附件"><Upload size={18}/></button><button className="send-btn" onClick={submit} title="保存"><Send size={18}/></button></section>
  </>;
}

function PageHead({ title, subtitle, action }) { return <div className="page-head"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>; }
function Metric({ label, value, pct }) { return <div className="metric"><span>{label}</span><strong>{value}</strong><div className="bar"><i style={{width: `${pct}%`}}/></div></div>; }

function Crm({ leads, setLeads, query, exportCsv, showToast }) {
  const [formOpen, setFormOpen] = useState(false);
  const filtered = useMemo(() => leads.filter(l => Object.values(l).join(' ').toLowerCase().includes(query.toLowerCase())), [leads, query]);
  const addLead = (e) => {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    setLeads([{ company: data.get('company'), country: data.get('country'), type: data.get('type'), contact: data.get('contact') || '待确认', status: '待开发', next: '完成背景调查', priority: 'B' }, ...leads]);
    setFormOpen(false); showToast('客户已加入CRM');
  };
  return <>
    <PageHead title="客户管理 CRM" subtitle="从公开信息、决策人触达到报价和订单，保留每一步证据" action={<div className="head-actions"><button className="secondary-btn" onClick={exportCsv}><Download size={17}/>导出 Excel</button><button className="primary-btn" onClick={() => setFormOpen(true)}><Plus size={17}/>新增客户</button></div>} />
    <div className="crm-summary"><Metric label="客户总数" value={String(leads.length)} pct={100}/><Metric label="A级机会" value={String(leads.filter(l => l.priority === 'A').length)} pct={70}/><Metric label="已找到决策人" value={String(leads.filter(l => l.status.includes('决策人')).length)} pct={42}/><Metric label="本周待跟进" value="5" pct={62}/></div>
    <section className="panel table-panel"><div className="data-table"><div className="data-head"><span>优先级</span><span>公司 / 国家</span><span>客户类型</span><span>联系人</span><span>进度</span><span>下一步</span></div>{filtered.map((lead, i) => <div className="data-row" key={lead.company}><span><b className={`priority p${lead.priority}`}>{lead.priority}</b></span><span><strong>{lead.company}</strong><small>{lead.country}</small></span><span>{lead.type}</span><span>{lead.contact}</span><span><em>{lead.status}</em></span><span>{lead.next}<button className="row-more"><MoreHorizontal size={17}/></button></span></div>)}</div></section>
    {formOpen && <Modal title="新增潜在客户" close={() => setFormOpen(false)}><form className="form-grid" onSubmit={addLead}><label>公司名称<input name="company" required/></label><label>国家/地区<input name="country" required/></label><label>客户类型<input name="type" required/></label><label>联系人<input name="contact"/></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setFormOpen(false)}>取消</button><button className="primary-btn">保存客户</button></div></form></Modal>}
  </>;
}

function Ielts({ showToast, openQuestionBank }) {
  const subjectKeys = Object.keys(ieltsSubjects);
  const today = localDateKey();
  const dayNumber = Math.floor(new Date(`${today}T00:00:00`).getTime() / 86400000);
  const weekday = (new Date().getDay() + 6) % 7;
  const [active, setActive] = useState('listening');
  const [session, setSession] = useState(null);
  const [translations, setTranslations] = useState([]);
  const [selectedWord, setSelectedWord] = useState('');
  const [progress, setProgress] = usePersistedState('lydia.ielts.learning.v2', {
    minutesByDay: {}, checkins: {}, taskOffsets: {}, vocabIndex: 0,
    knownWords: [], reviewWords: [], reviewCursor: 0
  });
  const schedule = [['周一','听力精听 + 口语Part 1'],['周二','阅读定位 + Task 1'],['周三','听力Section 3/4 + 口语Part 2'],['周四','阅读判断题 + Task 2'],['周五','听力套题 + 口语模拟'],['周六','阅读套题 + 写作复盘'],['周日','模考 + 错题复盘']];
  const subject = ieltsSubjects[active];
  const taskIndex = (dayNumber + subjectKeys.indexOf(active) + (progress.taskOffsets?.[active] || 0)) % subject.tasks.length;
  const task = subject.tasks[taskIndex];
  const vocabIndex = progress.vocabIndex % ieltsVocabulary.length;
  const vocab = ieltsVocabulary[vocabIndex];
  const minutes = progress.minutesByDay?.[today] || 0;
  const todayDone = progress.checkins?.[today] || [];
  const weekDone = Object.entries(progress.checkins || {}).filter(([date]) => (new Date(today) - new Date(date)) / 86400000 < 7).reduce((sum, [, items]) => sum + items.length, 0);
  const streak = (() => { let count = 0; const cursor = new Date(`${today}T00:00:00`); while ((progress.checkins?.[localDateKey(cursor)] || []).length) { count++; cursor.setDate(cursor.getDate() - 1); } return count; })();

  const patchProgress = patch => setProgress({ ...progress, ...patch });
  const recordMinutes = amount => patchProgress({ minutesByDay: { ...(progress.minutesByDay || {}), [today]: minutes + amount } });
  const advanceVocab = (needsReview) => {
    const list = needsReview ? [...new Set([...(progress.reviewWords || []), vocab.word])] : (progress.reviewWords || []).filter(word => word !== vocab.word);
    patchProgress({
      vocabIndex: (vocabIndex + 1) % ieltsVocabulary.length,
      reviewWords: list,
      knownWords: needsReview ? (progress.knownWords || []) : [...new Set([...(progress.knownWords || []), vocab.word])]
    });
    showToast(needsReview ? '已加入错词本，进入下一个词' : '已掌握，进入下一个词');
  };
  const beginTraining = () => {
    openQuestionBank();
    showToast(`已进入${subject.label}真题库，请选择题目开始练习`);
  };
  const finishTraining = () => {
    const nextDone = [...new Set([...todayDone, active])];
    setProgress({
      ...progress,
      minutesByDay: { ...(progress.minutesByDay || {}), [today]: minutes + subject.duration },
      checkins: { ...(progress.checkins || {}), [today]: nextDone },
      taskOffsets: { ...(progress.taskOffsets || {}), [active]: (progress.taskOffsets?.[active] || 0) + 1 }
    });
    setSession(null);
    showToast(`${subject.label}已完成，下一项训练已更新`);
  };
  const addReviewWord = word => {
    patchProgress({ reviewWords: [...new Set([...(progress.reviewWords || []), word])] });
    showToast(`${word} 已加入生词本`);
  };
  const exportReview = () => {
    if (!(progress.reviewWords || []).length) return showToast('错词本暂时为空');
    const rows = progress.reviewWords.map(word => { const item = ieltsVocabulary.find(v => v.word === word); return item ? `${item.word}\t${item.ipa}\t${item.meaning}` : word; });
    const url = URL.createObjectURL(new Blob(['\ufeff' + rows.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `IELTS_错词本_${today}.txt`; link.click(); URL.revokeObjectURL(url);
  };
  const reviewList = progress.reviewWords || [];
  const reviewWord = reviewList.length ? reviewList[(progress.reviewCursor || 0) % reviewList.length] : '';
  const contextDetail = contextParagraphs.flatMap(paragraph => paragraph.parts).find(part => Array.isArray(part) && part[0] === reviewWord);
  const reviewDetail = ieltsVocabulary.find(item => item.word === reviewWord) || (contextDetail ? {
    word: reviewWord,
    ipa: contextDetail[1].split(' ')[0],
    meaning: contextDetail[1].split(' ').slice(1).join(' '),
    example: 'Saved from the contextual vocabulary passage.'
  } : null);
  return <>
    <PageHead title="雅思 6.5 计划" subtitle={`${today} · 内容每日自动轮换，操作结果会保存在本机`} action={<button className="primary-btn" onClick={() => { recordMinutes(15); showToast('已记录15分钟学习'); }}><Plus size={17}/>记录15分钟</button>} />
    <section className="score-strip"><div className="score-main"><span>目标分数</span><strong>6.5</strong><small>稳定执行</small></div><Metric label="今日学习" value={`${minutes} 分钟`} pct={Math.min(100, minutes/90*100)}/><Metric label="本周完成" value={`${weekDone} 项`} pct={Math.min(100, weekDone/14*100)}/><Metric label="连续打卡" value={`${streak} 天`} pct={Math.min(100, streak/7*100)}/></section>
    <section className="panel week-panel"><div className="panel-title"><div><CalendarDays size={19}/>一周循环计划</div><span>今天的计划已突出显示</span></div><div className="week-grid">{schedule.map(([day, work], index) => <button className={weekday === index ? 'today' : ''} onClick={() => showToast(`${day}：${work}`)} key={day}><strong>{day}</strong><span>{work}</span></button>)}</div></section>
    <div className="study-grid dynamic-study"><section className="panel"><div className="panel-title"><div><Target size={19}/>今日训练</div><span>{todayDone.length} / 4 科完成</span></div><div className="study-tabs">{subjectKeys.map(key => <button className={active === key ? 'active' : ''} onClick={() => { setActive(key); setSession(null); }} key={key}>{ieltsSubjects[key].label}{todayDone.includes(key) && <Check size={14}/>}</button>)}</div><div className="lesson"><span className="lesson-kicker">{subject.label} · {subject.duration}分钟 · 今日第 {taskIndex + 1} 项</span><h2>{task[0]}</h2><p>{task[1]}</p><small>{subject.focus}</small><button className="primary-btn" onClick={beginTraining}>{todayDone.includes(active) ? '继续下一项' : '开始训练'}</button></div></section>
      <section className="panel vocab"><div className="panel-title"><div><BookOpen size={19}/>今日核心词汇</div><span>{vocabIndex + 1} / {ieltsVocabulary.length}</span></div><div className="vocab-card-nav"><button title="上一个" onClick={() => patchProgress({ vocabIndex: (vocabIndex - 1 + ieltsVocabulary.length) % ieltsVocabulary.length })}><ArrowLeft size={17}/></button><button title="下一个" onClick={() => patchProgress({ vocabIndex: (vocabIndex + 1) % ieltsVocabulary.length })}><ArrowRight size={17}/></button></div><strong>{vocab.word}</strong><span>{vocab.ipa}</span><p>{vocab.meaning}</p><blockquote>{vocab.example}</blockquote><div className="vocab-actions"><button onClick={() => advanceVocab(false)}><Check size={16}/>认识</button><button onClick={() => advanceVocab(true)}><X size={16}/>需复习</button></div></section></div>
    {session && <section className="panel training-session"><div className="panel-title"><div><Activity size={19}/>{session.title}</div><button onClick={() => setSession(null)}><X size={17}/></button></div><p>{ieltsSubjects[session.subject].focus}</p><div>{ieltsSubjects[session.subject].steps.map((step, index) => <label className={session.steps[index] ? 'done' : ''} key={step}><input type="checkbox" checked={session.steps[index]} onChange={() => setSession({ ...session, steps: session.steps.map((value, i) => i === index ? !value : value) })}/><span>{session.steps[index] && <Check size={14}/>}</span>{step}</label>)}</div><button className="primary-btn" disabled={!session.steps.every(Boolean)} onClick={finishTraining}>完成并进入下一项</button></section>}
    <div className="ielts-tools-grid"><section className="panel context-reader"><div className="panel-title"><div><FileText size={19}/>情境词汇短文</div><span>点击高亮词查看释义并收藏</span></div>{contextParagraphs.map((paragraph, index) => <article key={index}><p>{paragraph.parts.map((part, partIndex) => Array.isArray(part) ? <button className={selectedWord === part[0] ? 'selected' : ''} onClick={() => setSelectedWord(selectedWord === part[0] ? '' : part[0])} key={partIndex}>{part[0]}{selectedWord === part[0] && <span>{part[1]}<b onClick={event => { event.stopPropagation(); addReviewWord(part[0]); }}>加入生词本</b></span>}</button> : part)}</p><button className="translation-button" onClick={() => setTranslations(translations.includes(index) ? translations.filter(i => i !== index) : [...translations, index])}>{translations.includes(index) ? '隐藏本段译文' : '查看本段译文'}</button>{translations.includes(index) && <div className="translation-text-live">{paragraph.translation}</div>}</article>)}</section>
      <section className="panel error-book"><div className="panel-title"><div><BookOpen size={19}/>错词 / 错题本</div><span>{reviewList.length} 项</span></div>{reviewDetail ? <div className="review-card"><small>当前复习 {((progress.reviewCursor || 0) % reviewList.length) + 1} / {reviewList.length}</small><strong>{reviewDetail.word}</strong><span>{reviewDetail.ipa}</span><p>{reviewDetail.meaning}</p><blockquote>{reviewDetail.example}</blockquote><div><button className="secondary-btn" onClick={() => patchProgress({ reviewWords: reviewList.filter(word => word !== reviewWord), reviewCursor: 0 })}><Check size={16}/>已掌握</button><button className="primary-btn" onClick={() => patchProgress({ reviewCursor: ((progress.reviewCursor || 0) + 1) % reviewList.length })}>下一个<ArrowRight size={16}/></button></div></div> : <div className="empty-review"><CheckSquare size={28}/><strong>错词本为空</strong><span>点击“需复习”或收藏短文中的高亮词。</span></div>}<button className="export-review" onClick={exportReview}><Download size={16}/>导出错词本</button></section></div>
  </>;
}

function IeltsBank({ showToast }) {
  const [catalog, setCatalog] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [subject, setSubject] = useState('listening');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [partFilter, setPartFilter] = useState('全部');
  const [sceneFilter, setSceneFilter] = useState('全部');
  const [practiceItem, setPracticeItem] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = usePersistedState('lydia.ielts.catalogProgress', {});
  const subjectOrder = ['listening', 'reading', 'writing', 'speaking'];

  useEffect(() => {
    fetch('./ielts-catalog.json')
      .then(response => { if (!response.ok) throw new Error('题库目录加载失败'); return response.json(); })
      .then(setCatalog)
      .catch(error => setLoadError(error.message));
  }, []);

  const setItemStatus = (id, status) => {
    setProgress({ ...progress, [id]: { status, updatedAt: new Date().toISOString() } });
    showToast(status === 'completed' ? '已完成本题打卡' : status === 'active' ? '已加入进行中' : '已重置打卡状态');
  };
  const getStatus = id => progress[id]?.status || 'pending';
  const totalCompleted = Object.values(progress).filter(item => item.status === 'completed').length;
  const startPractice = item => {
    setItemStatus(item.id, 'active');
    setElapsed(0);
    setPracticeItem(item);
  };

  useEffect(() => {
    if (!practiceItem) return undefined;
    const timer = window.setInterval(() => setElapsed(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [practiceItem]);

  if (loadError) return <><PageHead title="雅思真题打卡" subtitle="公开题目目录每日同步，练习保留在原网站"/><section className="source-note"><Globe2/><div><strong>暂时无法加载目录</strong><span>{loadError}</span></div></section></>;
  if (!catalog) return <><PageHead title="雅思真题打卡" subtitle="正在加载听说读写真题目录…"/><section className="panel bank-loading">题库加载中…</section></>;

  const allRecords = subjectOrder.flatMap(key => catalog.subjects[key]?.records || []);
  const filters = catalog.subjects[subject]?.filters || {};
  const records = (catalog.subjects[subject]?.records || []).filter(item => {
    const matchesSearch = [item.title, item.part, item.scene, ...(item.types || [])].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === '全部' || item.types?.includes(typeFilter);
    const matchesPart = partFilter === '全部' || item.part === partFilter;
    const matchesScene = sceneFilter === '全部' || item.scene === sceneFilter;
    return matchesSearch && matchesType && matchesPart && matchesScene && (statusFilter === 'all' || getStatus(item.id) === statusFilter);
  });
  const todaySet = subjectOrder.map(key => {
    const list = catalog.subjects[key]?.records || [];
    return list.find(item => getStatus(item.id) !== 'completed') || list[0];
  }).filter(Boolean);
  const updatedDate = new Date(catalog.updatedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (practiceItem) {
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const seconds = String(elapsed % 60).padStart(2, '0');
    return <section className="exam-workspace">
      <header className="exam-header">
        <button className="secondary-btn" onClick={() => setPracticeItem(null)}><ArrowLeft size={17}/>返回题库</button>
        <div><span>{catalog.subjects[practiceItem.subject]?.label} · {practiceItem.part}</span><strong>{practiceItem.title}</strong></div>
        <time>{minutes}:{seconds}</time>
        <button className="secondary-btn" onClick={() => { setItemStatus(practiceItem.id, 'active'); showToast('练习进度已保存'); }}><Check size={17}/>保存进度</button>
        <button className="primary-btn" onClick={() => { setItemStatus(practiceItem.id, 'completed'); setPracticeItem(null); }}>完成练习</button>
      </header>
      <div className="exam-source-bar">
        <div><Globe2 size={17}/><span>工作台内直接加载即刻说雅思原题页；题干、音频、选项、答案和解析仍由原站提供。</span></div>
        <a href={practiceItem.originalUrl} target="_blank" rel="noreferrer">新窗口打开<ExternalLink size={15}/></a>
      </div>
      <iframe className="exam-frame" src={practiceItem.originalUrl} title={`${practiceItem.title} 雅思练习`} allow="autoplay; clipboard-write; microphone" />
    </section>;
  }

  return <>
    <PageHead title="雅思真题练习" subtitle={`即刻说雅思原题页内嵌练习 · 题库目录更新 ${updatedDate}`} action={<a className="secondary-btn" href={catalog.sourceUrl} target="_blank" rel="noreferrer"><Globe2 size={17}/>打开原站</a>} />
    <section className="bank-summary">
      <div className="bank-goal"><span>题库总量</span><strong>{allRecords.length}</strong><small>仅同步公开目录，不复制题目正文</small></div>
      {subjectOrder.map(key => <button className={subject === key ? 'active' : ''} onClick={() => setSubject(key)} key={key}><span>{catalog.subjects[key].label}</span><strong>{catalog.subjects[key].total}</strong><small>已完成 {catalog.subjects[key].records.filter(item => getStatus(item.id) === 'completed').length}</small></button>)}
      <div className="bank-completed"><span>累计完成</span><strong>{totalCompleted}</strong><small>{allRecords.length ? Math.round(totalCompleted / allRecords.length * 100) : 0}%</small></div>
    </section>
    <section className="panel daily-bank">
      <div className="panel-title"><div><CalendarDays size={19}/>今日四科打卡</div><span>每天各完成1题</span></div>
      <div className="daily-bank-grid">{todaySet.map(item => <article key={item.id} className={getStatus(item.id)}><div><span>{catalog.subjects[item.subject].label}</span><small>{item.part || item.types?.[0]}</small></div><strong>{item.title}</strong><div className="bank-actions"><button className="practice-link" onClick={() => startPractice(item)}>在工作台练习 →</button><button title="完成打卡" onClick={() => setItemStatus(item.id, getStatus(item.id) === 'completed' ? 'pending' : 'completed')}><Check size={17}/></button></div></article>)}</div>
    </section>
    <section className="panel bank-library">
      <div className="bank-toolbar"><div className="subject-tabs">{subjectOrder.map(key => <button className={subject === key ? 'active' : ''} onClick={() => { setSubject(key); setTypeFilter('全部'); setPartFilter('全部'); setSceneFilter('全部'); }} key={key}>{catalog.subjects[key].label}<span>{catalog.subjects[key].total}</span></button>)}</div><label><Search size={16}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索题目、场景、题型"/></label><select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="all">全部状态</option><option value="pending">未开始</option><option value="active">进行中</option><option value="completed">已完成</option></select></div>
      <div className="bank-filters"><Filter size={16}/><select value={typeFilter} onChange={event => setTypeFilter(event.target.value)}>{['全部', ...(filters.types || []).filter(value => value !== '全部')].map(value => <option key={value}>{value}</option>)}</select><select value={partFilter} onChange={event => setPartFilter(event.target.value)}>{['全部', ...(filters.parts || []).filter(value => value !== '全部')].map(value => <option key={value}>{value}</option>)}</select><select value={sceneFilter} onChange={event => setSceneFilter(event.target.value)}>{['全部', ...(filters.scenes || []).filter(value => value !== '全部')].map(value => <option key={value}>{value}</option>)}</select><span>{records.length} 道匹配题目</span></div>
      <div className="bank-list">{records.slice(0, 80).map(item => { const itemStatus = getStatus(item.id); return <article key={item.id} className={itemStatus}><button className="status-toggle" title="切换状态" onClick={() => setItemStatus(item.id, itemStatus === 'pending' ? 'active' : itemStatus === 'active' ? 'completed' : 'pending')}>{itemStatus === 'completed' ? <Check size={16}/> : itemStatus === 'active' ? <Activity size={16}/> : <span/>}</button><div className="bank-item-main"><div><strong>{item.title}</strong><span>{item.part}</span></div><p>{[...(item.types || []), item.scene, item.hitTime].filter(Boolean).join(' · ')}</p></div><div className="bank-item-meta">{item.accuracy >= 0 && <span>正确率 {item.accuracy}%</span>}{item.practitioners >= 0 && <span>{item.practitioners}人练习</span>}</div><button className="practice-link" onClick={() => startPractice(item)}>开始练习 →</button></article> })}</div>
      {records.length > 80 && <div className="bank-footnote">当前显示前80条，请通过搜索和状态筛选缩小范围。</div>}
    </section>
  </>;
}

function Social({ showToast }) {
  const [platform, setPlatform] = useState('LinkedIn');
  const [title, setTitle] = usePersistedState('lydia.social.title', '多电池兼容工作灯：为什么能减少渠道库存');
  const [draft, setDraft] = usePersistedState('lydia.social.draft', 'A portable work light should solve a real job-site problem: reliable illumination without adding another battery system.');
  const [publishDate, setPublishDate] = useState(localDateKey(new Date(Date.now() + 86400000)));
  const [queue, setQueue] = usePersistedState('lydia.social.queue.v2', []);
  const saveDraft = () => showToast('草稿已保存在本机');
  const optimize = () => {
    const cleaned = draft.replace(/\s+/g, ' ').replace(/\. /g, '.\n\n').trim();
    setDraft(cleaned);
    showToast('已整理段落和多余空格');
  };
  const schedulePost = () => {
    if (!title.trim() || !draft.trim()) return showToast('请先填写主题和正文');
    const item = { id: Date.now(), platform, title: title.trim(), draft: draft.trim(), date: publishDate, status: '待发布' };
    setQueue([...queue, item].sort((a, b) => a.date.localeCompare(b.date)));
    showToast(`${platform}内容已加入 ${publishDate} 排期`);
  };
  return <><PageHead title="社媒内容工作台" subtitle="从草稿、排期到发布状态，每一步都可编辑和保存" action={<button className="primary-btn" onClick={saveDraft}><Check size={17}/>保存草稿</button>} />
    <div className="social-grid"><section className="panel content-editor"><div className="platform-tabs">{['LinkedIn','Facebook','Instagram'].map(p => <button className={platform === p ? 'active' : ''} onClick={() => setPlatform(p)} key={p}>{p}</button>)}</div><label>内容主题<input value={title} onChange={event => setTitle(event.target.value)}/></label><label>正文<textarea value={draft} onChange={e => setDraft(e.target.value)}/></label><div className="schedule-control"><label>发布日期<input type="date" value={publishDate} onChange={event => setPublishDate(event.target.value)}/></label></div><div className="editor-actions"><span>{draft.length} 字符</span><button className="secondary-btn" onClick={optimize}><Sparkles size={17}/>整理表达</button><button className="primary-btn" onClick={schedulePost}><CalendarDays size={17}/>加入排期</button></div></section><section className="panel content-queue"><div className="panel-title"><div><CalendarDays size={19}/>发布排期</div><span>{queue.length} 条</span></div>{queue.length ? queue.map(item => <div className="queue-row" key={item.id}><time>{item.date.slice(5)}</time><div><strong>{item.platform}</strong><span>{item.title}</span><button className={item.status === '已发布' ? 'published' : ''} onClick={() => setQueue(queue.map(row => row.id === item.id ? { ...row, status: row.status === '已发布' ? '待发布' : '已发布' } : row))}>{item.status}</button></div><button className="queue-delete" title="删除" onClick={() => setQueue(queue.filter(row => row.id !== item.id))}><Trash2 size={16}/></button></div>) : <div className="empty-queue"><CalendarDays size={25}/><span>暂无排期，从左侧加入第一条内容。</span></div>}</section></div>
  </>;
}

function Intel({ showToast }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [lastChecked, setLastChecked] = usePersistedState('lydia.intel.lastChecked', '尚未更新');
  const [analyses, setAnalyses] = usePersistedState('lydia.intel.analyses', {});
  const items = intel.concat(intel.slice(0, 2));
  const activeItem = activeIndex === null ? null : items[activeIndex];
  const updateIntel = () => {
    const stamp = new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    setLastChecked(stamp);
    showToast(`已记录本次检查：${stamp}`);
  };
  const saveAnalysis = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setAnalyses({ ...analyses, [activeIndex]: { evidence: data.get('evidence'), conclusion: data.get('conclusion'), action: data.get('action'), status: data.get('status'), updatedAt: new Date().toISOString() } });
    setActiveIndex(null);
    showToast('情报分析已保存');
  };
  const saved = activeIndex === null ? {} : analyses[activeIndex] || {};
  return <><PageHead title="LED 行业情报" subtitle={`核验来源、记录判断并转化为销售行动 · 上次检查 ${lastChecked}`} action={<button className="primary-btn" onClick={updateIntel}><Activity size={17}/>记录本次检查</button>} /><section className="source-note"><Globe2 size={19}/><div><strong>当前条目为待核验情报线索</strong><span>点击“查看与分析”后录入原始来源、对HANMA的影响和下一步行动，不把未核实内容当成事实。</span></div></section><section className="panel intel-library">{items.map((item,i) => <article key={`${item.title}-${i}`}><div><span>{item.source}</span><time>{item.time}</time></div><h3>{item.title}</h3><p>{analyses[i]?.conclusion || '待核验：尚未录入可追溯来源和销售结论。'}</p><footer><span className={`impact ${item.tone}`}>{analyses[i]?.status || item.impact}</span><button onClick={() => setActiveIndex(i)}>查看与分析 →</button></footer></article>)}</section>{activeItem && <Modal title={activeItem.title} close={() => setActiveIndex(null)}><form className="analysis-form" onSubmit={saveAnalysis}><label>原始来源 / 证据链接<input name="evidence" defaultValue={saved.evidence || ''} placeholder="粘贴官方网站、行业协会或客户原文链接"/></label><label>对HANMA的实际影响<textarea name="conclusion" defaultValue={saved.conclusion || ''} placeholder="说明影响哪类产品、市场或客户"/></label><label>下一步行动<textarea name="action" defaultValue={saved.action || ''} placeholder="例如：向欧洲经销商确认认证要求"/></label><label>状态<select name="status" defaultValue={saved.status || '待核验'}><option>待核验</option><option>已核验</option><option>机会</option><option>风险</option><option>不采用</option></select></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setActiveIndex(null)}>取消</button><button className="primary-btn">保存分析</button></div></form></Modal>}</>;
}

function ExcelCenter({ leads, exportCsv, showToast }) { return <><PageHead title="Excel 数据中心" subtitle="统一导入、清洗、去重并导出客户与工作记录" action={<button className="primary-btn" onClick={exportCsv}><Download size={17}/>导出当前CRM</button>} /><div className="excel-grid"><section className="panel upload-zone"><Upload size={28}/><h2>导入客户表格</h2><p>支持下一阶段接入 .xlsx、.csv；当前演示版提供CSV导出。</p><button className="secondary-btn" onClick={() => showToast('Excel导入将在云端版启用')}>选择文件</button></section><section className="panel"><div className="panel-title"><div><Database size={19}/>当前数据</div></div><div className="data-health"><strong>{leads.length}</strong><span>客户记录</span><strong>{leads.filter(x=>x.contact !== '待确认').length}</strong><span>有联系人</span><strong>{leads.filter(x=>x.priority === 'A').length}</strong><span>A级机会</span></div></section></div><section className="panel rules-list"><div className="panel-title"><div><FileSpreadsheet size={19}/>标准化规则</div></div>{['保留客户历史记录原文，不自动改写','官网、LinkedIn及公开邮箱分别保留证据链接','未核实联系人和推测信息标记为待确认','同一客户的多个历史编码合并维护'].map((x,i)=><div key={x}><span>{i+1}</span><p>{x}</p><Check size={17}/></div>)}</section></> }

function WritingLab({ mode, showToast }) { const [text,setText]=useState(''); return <><PageHead title={mode === 'terms' ? 'LED 后装术语' : '写作与邮件批改'} subtitle={mode === 'terms' ? '建立中英术语、参数、应用和客户价值的可检索知识库' : '先检查事实和目的，再优化欧洲客户常用商务表达'} /><section className="panel writing-lab"><div className="lab-toolbar"><button className="active">商务邮件</button><button>雅思写作</button><button>产品规格</button></div><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="粘贴需要检查的英文内容，或输入LED车灯术语……"/><div className="editor-actions"><span>{text.length} 字符</span><button className="primary-btn" onClick={()=>showToast('本地检查完成；AI评分需连接服务器')}><Bot size={17}/>开始检查</button></div></section></> }

function Modal({ title, close, children }) { return <div className="modal-scrim"><div className="modal"><div className="modal-head"><h2>{title}</h2><button onClick={close}><X/></button></div>{children}</div></div> }
function MobileNav({ page, setPage, openMore }) { return <nav className="mobile-nav">{[['today','今日',Home],['crm','客户',UsersRound],['ielts','学习',BookOpen],['social','社媒',BarChart3]].map(([id,label,Icon])=><button className={page===id?'active':''} onClick={()=>setPage(id)} key={id}><Icon/><span>{label}</span></button>)}<button onClick={openMore}><MoreHorizontal/><span>更多</span></button></nav> }

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
