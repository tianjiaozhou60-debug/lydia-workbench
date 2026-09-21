export const ieltsSubjects = {
  listening: {
    label: '听力',
    duration: 25,
    focus: '先盲听抓主线，再精听定位同义替换，最后跟读复盘。',
    tasks: [
      ['Section 3 场景精听与同义替换', '完成一组多人讨论题，记录至少5组题干与原文替换。'],
      ['Section 4 学术独白结构笔记', '用标题、转折和举例信号词还原讲座结构。'],
      ['地图题方位表达专项', '整理入口、相邻、对面、穿过等高频定位表达。'],
      ['选择题干扰项辨析', '逐题写明错误选项为什么与原文不一致。'],
      ['数字与拼写听写', '集中训练日期、价格、地址和专有名词拼写。']
    ],
    steps: ['限时完成题目', '核对答案并标记失分原因', '回听证据句与同义替换', '跟读证据句并记录错题']
  },
  speaking: {
    label: '口语',
    duration: 25,
    focus: '先给直接答案，再用原因、细节和例子自然展开。',
    tasks: [
      ['Part 2 产品与工作经历表达', '用准备、困难、解决、结果四步讲述一次真实工作经历。'],
      ['Part 1 Work and Study', '完成8个短问答，避免只有一句话的回答。'],
      ['Part 2 A useful object', '描述一个工作中常用的工具，并说明它解决的问题。'],
      ['Part 3 Technology at work', '练习比较、让步和举例，形成两分钟讨论。'],
      ['流利度与停顿修正', '录音两遍，第二遍减少无意义停顿和重复。']
    ],
    steps: ['准备关键词1分钟', '录音回答2分钟', '回听并标记停顿与语法问题', '重录并保存更自然的表达']
  },
  reading: {
    label: '阅读',
    duration: 25,
    focus: '题干找定位词，原文找证据句，只依据文本作答。',
    tasks: [
      ['判断题定位与证据句', '每题保留定位词、证据句和判断依据。'],
      ['段落标题主旨匹配', '区分主题句、例子和转折后的真正主旨。'],
      ['填空题词性预测', '先判断空格词性和单复数，再回原文定位。'],
      ['人名观点匹配', '建立人物与观点表，注意否定和态度变化。'],
      ['长难句拆解专项', '找主干、从句和修饰成分，再做准确释义。']
    ],
    steps: ['限时阅读并完成题目', '圈出定位词与证据句', '给每道错题标注原因', '整理同义替换并重做错题']
  },
  writing: {
    label: '写作',
    duration: 30,
    focus: '先明确立场和段落任务，再写主题句、解释和具体例证。',
    tasks: [
      ['Task 2 论证结构训练', '完成引言、两个主体段提纲和结论，不堆砌模板句。'],
      ['Task 1 趋势图比较', '选择最重要的总体趋势与关键比较，避免逐点罗列。'],
      ['Task 2 双边讨论', '准确区分双方观点，并给出自己的清晰立场。'],
      ['Task 1 流程图描述', '使用阶段、顺序和被动语态准确描述全过程。'],
      ['句子升级与错误复盘', '改写5个旧句，修正搭配、冠词和句子边界。']
    ],
    steps: ['分析题目并确定立场', '列出段落提纲与例证', '限时完成核心段落', '按任务回应、衔接、词汇和语法自查']
  }
};

export const ieltsVocabulary = [
  { word: 'significant', ipa: '/sɪɡˈnɪfɪkənt/', meaning: '显著的；重要的', example: 'There has been a significant increase in demand for portable work lights.' },
  { word: 'controversial', ipa: '/ˌkɒntrəˈvɜːʃl/', meaning: '有争议的', example: 'The proposal remains controversial among local residents.' },
  { word: 'prioritise', ipa: '/praɪˈɒrətaɪz/', meaning: '优先考虑', example: 'Governments should prioritise long-term public investment.' },
  { word: 'infrastructure', ipa: '/ˈɪnfrəstrʌktʃə/', meaning: '基础设施', example: 'Reliable infrastructure supports sustainable economic growth.' },
  { word: 'eliminate', ipa: '/ɪˈlɪmɪneɪt/', meaning: '消除；排除', example: 'Better training can eliminate avoidable workplace errors.' },
  { word: 'substantial', ipa: '/səbˈstænʃl/', meaning: '大量的；重大的', example: 'The project requires a substantial initial investment.' },
  { word: 'consequently', ipa: '/ˈkɒnsɪkwəntli/', meaning: '因此；所以', example: 'Fuel prices rose; consequently, transport costs increased.' },
  { word: 'feasible', ipa: '/ˈfiːzəbl/', meaning: '可行的', example: 'Remote work is not feasible for every occupation.' },
  { word: 'allocate', ipa: '/ˈæləkeɪt/', meaning: '分配', example: 'More funding should be allocated to vocational education.' },
  { word: 'deteriorate', ipa: '/dɪˈtɪəriəreɪt/', meaning: '恶化', example: 'Air quality may deteriorate without effective regulation.' },
  { word: 'compelling', ipa: '/kəmˈpelɪŋ/', meaning: '令人信服的；引人注目的', example: 'The report provides compelling evidence for reform.' },
  { word: 'inevitable', ipa: '/ɪnˈevɪtəbl/', meaning: '不可避免的', example: 'Some degree of change is inevitable in a growing city.' },
  { word: 'whereas', ipa: '/weərˈæz/', meaning: '然而；鉴于', example: 'Urban populations increased, whereas rural figures declined.' },
  { word: 'enhance', ipa: '/ɪnˈhɑːns/', meaning: '提高；增强', example: 'Regular feedback can enhance learning efficiency.' },
  { word: 'mitigate', ipa: '/ˈmɪtɪɡeɪt/', meaning: '缓解；减轻', example: 'Public transport can help mitigate traffic congestion.' }
];

const coreExampleTranslations = {
  significant: '便携式工作灯的需求显著增长。',
  controversial: '该提议在当地居民中仍有争议。',
  prioritise: '政府应优先考虑长期公共投资。',
  infrastructure: '可靠的基础设施支持可持续的经济增长。',
  eliminate: '更好的培训可以消除可避免的工作失误。',
  substantial: '该项目需要一笔可观的初期投资。',
  consequently: '燃油价格上涨，因此运输成本增加。',
  feasible: '远程工作并非适用于所有职业。',
  allocate: '应为职业教育分配更多资金。',
  deteriorate: '如果缺乏有效监管，空气质量可能恶化。',
  compelling: '这份报告为改革提供了有力的证据。',
  inevitable: '在不断发展的城市中，一定程度的变化不可避免。',
  whereas: '城市人口增长，而农村人口减少。',
  enhance: '定期反馈可以提高学习效率。',
  mitigate: '公共交通有助于缓解交通拥堵。'
};

ieltsVocabulary.forEach(item => { item.translation = coreExampleTranslations[item.word]; });

export const contextParagraphSets = [
  [
    { parts: ['The city council faced a ', ['controversial', '/ˌkɒntrəˈvɜːʃl/ 有争议的'], ' issue when drafting the new ', ['budget', '/ˈbʌdʒɪt/ 预算'], '. Many local leaders began ', ['prioritising', '/praɪˈɒrətaɪzɪŋ/ 优先考虑'], ' public infrastructure over smaller projects, hoping to ', ['boost', '/buːst/ 促进；提高'], ' economic growth.'], translation: '市议会在制定新预算时面临一个有争议的议题。许多地方领导人开始优先考虑公共基础设施，希望以此促进经济增长。' },
    { parts: ['Experts warned that relying on short-term solutions might ', ['boomerang', '/ˈbuːməræŋ/ 产生反效果'], ' in the future. A ', ['dearth of', '/dɜːθ əv/ 缺乏'], ' skilled labour could leave companies ', ['worse off', '/wɜːs ɒf/ 处境更差'], ' than before.'], translation: '专家警告，依赖短期方案未来可能产生反效果。专业人才匮乏可能使企业的处境比以前更差。' },
    { parts: ['An ', ['esteemed', '/ɪˈstiːmd/ 受尊敬的'], ' institute proposed a plan to ', ['liberalise', '/ˈlɪbrəlaɪz/ 放宽限制'], ' trade rules and ', ['refocus', '/ˌriːˈfəʊkəs/ 重新聚焦'], ' resources on training, thereby ', ['eliminating', '/ɪˈlɪmɪneɪtɪŋ/ 消除'], ' structural barriers.'], translation: '一家受人尊敬的研究所提出放宽贸易规则，并将资源重新聚焦于培训，从而消除结构性障碍。' }
  ],
  [
    { parts: ['Cities are expanding public transport to ', ['mitigate', '/ˈmɪtɪɡeɪt/ 缓解'], ' congestion and reduce vehicle ', ['emissions', '/ɪˈmɪʃənz/ 排放物'], '. The policy is expected to produce ', ['tangible', '/ˈtændʒəbl/ 切实的'], ' environmental benefits.'], translation: '城市正在扩大公共交通，以缓解拥堵并减少车辆排放。该政策预计将带来切实的环境效益。' },
    { parts: ['However, the transition requires a ', ['substantial', '/səbˈstænʃl/ 大量的'], ' investment. Authorities must ', ['allocate', '/ˈæləkeɪt/ 分配'], ' funds carefully and ensure that services remain ', ['accessible', '/əkˈsesəbl/ 易于使用的'], ' to low-income residents.'], translation: '然而，转型需要大量投资。当局必须谨慎分配资金，并确保低收入居民也能便利使用服务。' }
  ],
  [
    { parts: ['Many schools have begun to ', ['integrate', '/ˈɪntɪɡreɪt/ 融合'], ' digital tools into daily lessons. Supporters argue that interactive resources can ', ['enhance', '/ɪnˈhɑːns/ 提高'], ' engagement and provide ', ['immediate', '/ɪˈmiːdiət/ 即时的'], ' feedback.'], translation: '许多学校已开始将数字工具融入日常课堂。支持者认为，互动资源可提高参与度并提供即时反馈。' },
    { parts: ['Critics remain ', ['sceptical', '/ˈskeptɪkl/ 持怀疑态度的'], ', noting that unequal access may ', ['widen', '/ˈwaɪdn/ 扩大'], ' the achievement gap. Teacher training is therefore ', ['indispensable', '/ˌɪndɪˈspensəbl/ 不可或缺的'], '.'], translation: '批评者仍持怀疑态度，指出不平等的设备获取条件可能扩大学业差距。因此，教师培训不可或缺。' }
  ],
  [
    { parts: ['Flexible working has become increasingly ', ['prevalent', '/ˈprevələnt/ 普遍的'], ' across knowledge-based industries. It can reduce commuting time and give employees greater ', ['autonomy', '/ɔːˈtɒnəmi/ 自主权'], ' over their schedules.'], translation: '弹性工作在知识型行业中越来越普遍。它可减少通勤时间，并让员工对工作安排拥有更大自主权。' },
    { parts: ['Nevertheless, managers must establish ', ['explicit', '/ɪkˈsplɪsɪt/ 明确的'], ' expectations to prevent communication from ', ['deteriorating', '/dɪˈtɪəriəreɪtɪŋ/ 恶化'], '. Regular feedback can also ', ['foster', '/ˈfɒstə/ 促进'], ' trust within remote teams.'], translation: '尽管如此，管理者必须设定明确预期，防止沟通恶化。定期反馈也能促进远程团队内的信任。' }
  ],
  [
    { parts: ['Preserving historic buildings can strengthen a city\'s cultural ', ['identity', '/aɪˈdentəti/ 身份特征'], ' and attract visitors. These sites provide ', ['compelling', '/kəmˈpelɪŋ/ 令人信服的'], ' evidence of how communities have ', ['evolved', '/ɪˈvɒlvd/ 演变'], ' over time.'], translation: '保护历史建筑能强化城市的文化身份，并吸引游客。这些场所为社区如何随时间演变提供了有力证据。' },
    { parts: ['At the same time, restoration must be financially ', ['feasible', '/ˈfiːzəbl/ 可行的'], '. A balanced strategy can ', ['safeguard', '/ˈseɪfɡɑːd/ 保护'], ' heritage without ', ['hindering', '/ˈhɪndərɪŋ/ 阻碍'], ' necessary urban development.'], translation: '同时，修复工作必须在经济上可行。平衡的策略可以保护遗产，而不阻碍必要的城市发展。' }
  ]
];

export const contextParagraphs = contextParagraphSets[0];

const contextualVocabulary = contextParagraphSets.flatMap(group => group.flatMap(paragraph => {
  const example = paragraph.parts.map(part => Array.isArray(part) ? part[0] : part).join('');
  return paragraph.parts.filter(Array.isArray).map(([word, detail]) => {
    const phonetic = detail.match(/^(\/.*\/)(?:\s+)(.*)$/);
    return {
      word,
      ipa: phonetic?.[1] || detail,
      meaning: phonetic?.[2] || '',
      example,
      translation: paragraph.translation
    };
  });
}));

export const ieltsLexicon = new Map(
  [...contextualVocabulary, ...ieltsVocabulary].map(item => [item.word.toLowerCase(), item])
);

export const getIeltsWord = word => ieltsLexicon.get(String(word || '').toLowerCase());
