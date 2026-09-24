const REQUEST_TIMEOUT_MS = 9000;

const contextLabels = {
  ielts: '雅思英语',
  trade: '外贸英语',
  automotive: '汽车LED术语'
};

const partOfSpeechNames = {
  n: 'noun',
  v: 'verb',
  adj: 'adjective',
  adv: 'adverb',
  u: 'word / phrase'
};

const clean = value => String(value || '').replace(/\s+/g, ' ').trim();

export function getPartOfSpeechGuide(type = 'word / phrase') {
  const value = clean(type).toLowerCase();
  if (value.includes('sentence')) return {
    label: '完整句子',
    plain: '这是一整句话，不是单独一种词性。',
    position: '整句通常由“谁或什么 + 做什么 / 是什么”组成，可以直接用于表达完整意思。',
    pattern: '主语 + 动词 + 其他信息'
  };
  if (value.includes('noun')) return {
    label: value.includes('phrase') ? '名词短语' : '名词',
    plain: '给人、物、事情或概念起名字的词。',
    position: '常放在 a / an / the、this / that、形容词后面；可在动词前表示“谁或什么”，也可放在动词或介词后面表示对象。',
    pattern: 'the + 名词；动词 + 名词；介词 + 名词'
  };
  if (value.includes('verb')) return {
    label: '动词',
    plain: '表示动作、变化或状态，也就是“做什么 / 怎么了”。',
    position: '通常放在主语后面；在 to、can、will、should 后面一般使用动词原形。',
    pattern: '主语 + 动词；to / can / will + 动词原形'
  };
  if (value.includes('adjective')) return {
    label: '形容词',
    plain: '用来说明人或东西“是什么样”的词。',
    position: '常放在名词前面修饰名词，或者放在 be、look、seem、become 后面。',
    pattern: '形容词 + 名词；be + 形容词'
  };
  if (value.includes('adverb')) return {
    label: '副词',
    plain: '用来补充动作“怎么、何时、到什么程度”的词。',
    position: '位置比较灵活，常放在动词前后、形容词前面，或者句首和句末。',
    pattern: '副词 + 形容词；动词 + 副词'
  };
  if (value.includes('preposition')) return {
    label: '介词',
    plain: '用来说明时间、地点、方向或事物之间关系的词。',
    position: '通常放在名词或代词前面，后面必须接一个对象。',
    pattern: '介词 + 名词 / 代词'
  };
  return {
    label: '词组 / 短语',
    plain: '由两个或更多单词组成，合起来表达一个固定或常用意思。',
    position: '要把整个短语当成一个单位使用，具体位置取决于它在句中充当名词、动词还是形容词。',
    pattern: '整组记忆，不要逐词直译'
  };
}

export function getUsageGuide(term, meaning, context = 'trade', definitionMeaning = '') {
  const focus = clean(definitionMeaning || meaning);
  const lower = `${term} ${focus}`.toLowerCase();
  if (/remittance|payment|deposit|balance|invoice|付款|汇款|定金|尾款/.test(lower)) {
    return `用于付款和银行汇款场景，例如确认客户汇款、定金、尾款或到账情况。要表达“价格”时不要使用这个词。`;
  }
  if (/beam|lumen|voltage|housing|bracket|corrosion|照明|光束|电压|外壳|支架|腐蚀/.test(lower)) {
    return `用于汽车LED产品规格、宣传册、报价资料和技术沟通，重点表达“${focus}”。`;
  }
  if (context === 'ielts') return `用于雅思阅读、写作或口语中表达“${focus}”；先确认它在句中承担的词性，再决定位置。`;
  if (context === 'automotive') return `用于汽车后装市场的产品、应用或客户沟通中表达“${focus}”；技术参数必须结合具体产品核实。`;
  return `用于外贸邮件、报价、订单或客户沟通中表达“${focus}”；正式发送前要确认它符合当前商务语境。`;
}

async function fetchJson(url, timeout = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Online service returned ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function translate(text) {
  if (!clean(text)) return '';
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', clean(text).slice(0, 450));
  url.searchParams.set('langpair', 'en|zh-CN');
  const payload = await fetchJson(url);
  return clean(payload?.responseData?.translatedText);
}

const tagValue = (tags, prefix) => (tags || []).find(tag => tag.startsWith(prefix))?.slice(prefix.length) || '';

async function lookupMetadata(term) {
  const url = new URL('https://api.datamuse.com/words');
  url.searchParams.set('sp', term);
  url.searchParams.set('qe', 'sp');
  url.searchParams.set('md', 'dpr');
  url.searchParams.set('ipa', '1');
  url.searchParams.set('max', '1');
  const [item] = await fetchJson(url);
  if (!item || clean(item.word).toLowerCase() !== term.toLowerCase()) return null;
  const definition = clean(item.defs?.[0]?.replace(/^[^\t]*\t/, ''));
  const partTag = (item.tags || []).find(tag => partOfSpeechNames[tag]);
  return {
    word: clean(item.word) || term,
    ipa: tagValue(item.tags, 'ipa_pron:'),
    type: partOfSpeechNames[partTag] || 'word / phrase',
    definition
  };
}

async function lookupRelated(term) {
  const url = new URL('https://api.datamuse.com/words');
  url.searchParams.set('rel_syn', term);
  url.searchParams.set('max', '5');
  const rows = await fetchJson(url);
  return rows.map(row => clean(row.word)).filter(Boolean).slice(0, 4);
}

async function lookupExample(term) {
  const url = new URL('https://api.tatoeba.org/v1/sentences');
  url.searchParams.set('lang', 'eng');
  url.searchParams.set('q', term);
  url.searchParams.set('sort', 'relevance');
  url.searchParams.set('is_unapproved', 'no');
  url.searchParams.set('limit', '8');
  const payload = await fetchJson(url);
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  const normalized = term.toLowerCase();
  const preferred = rows.find(row => {
    const text = clean(row.text);
    const words = text.split(/\s+/).length;
    return text.toLowerCase().includes(normalized) && words >= 4 && words <= 22;
  });
  return clean((preferred || rows[0])?.text);
}

export function fallbackExample(term, type = 'word / phrase', context = 'trade') {
  const value = clean(term);
  if (type === 'verb') return `We need to ${value} the information before making a decision.`;
  if (type === 'adjective') return `This is a ${value} requirement for the project.`;
  if (context === 'automotive') return `The technical discussion included the term “${value}” in relation to the vehicle lighting application.`;
  if (context === 'ielts') return `The article explains the meaning of “${value}” in a clear academic context.`;
  return `The customer asked us to explain the term “${value}” in the product proposal.`;
}

export async function lookupOnlineVocabulary(input, context = 'trade') {
  const term = clean(input);
  if (!term) throw new Error('请输入需要查询的英文');
  const isSentence = /[.!?]$/.test(term) || term.split(/\s+/).length > 7;

  const [metadataResult, relatedResult, exampleResult, termTranslationResult] = await Promise.allSettled([
    isSentence ? Promise.resolve(null) : lookupMetadata(term),
    isSentence ? Promise.resolve([]) : lookupRelated(term),
    isSentence ? Promise.resolve(term) : lookupExample(term),
    translate(term)
  ]);

  const metadata = metadataResult.status === 'fulfilled' ? metadataResult.value : null;
  const relatedWords = relatedResult.status === 'fulfilled' ? relatedResult.value : [];
  const example = clean(exampleResult.status === 'fulfilled' ? exampleResult.value : '')
    || fallbackExample(term, metadata?.type, context);
  const shortMeaning = clean(termTranslationResult.status === 'fulfilled' ? termTranslationResult.value : '');
  if (!shortMeaning) throw new Error('在线翻译暂时不可用，请稍后重试');

  const relatedMetadataResults = await Promise.allSettled(relatedWords.map(word => lookupMetadata(word)));
  const relatedMetadata = relatedMetadataResults.map(result => result.status === 'fulfilled' ? result.value : null);
  const relatedDefinitions = relatedMetadata.map(item => item?.definition || '');
  const secondaryTexts = [metadata?.definition, example, ...relatedWords, ...relatedDefinitions];
  const translated = await Promise.allSettled(secondaryTexts.map(value => translate(value)));
  const translatedValues = translated.map(result =>
    result.status === 'fulfilled' ? clean(result.value) : ''
  );
  const definitionTranslation = translatedValues[0];
  const exampleTranslation = translatedValues[1];
  const relatedTranslations = translatedValues.slice(2, 2 + relatedWords.length);
  const relatedDefinitionTranslations = translatedValues.slice(2 + relatedWords.length);
  const meaning = definitionTranslation && definitionTranslation !== shortMeaning
    ? `${shortMeaning}；${definitionTranslation}`
    : shortMeaning;
  const related = relatedWords.map((word, index) => {
    const synonymMeaning = relatedTranslations[index] || '';
    const synonymDefinition = relatedDefinitionTranslations[index] || synonymMeaning;
    const mainFinancial = /remittance|sending money|money transfer|汇款|付款/i.test(`${term} ${metadata?.definition || ''} ${definitionTranslation}`);
    const synonymFinancial = /remittance|sending money|money transfer|汇款|付款/i.test(`${word} ${relatedMetadata[index]?.definition || ''} ${synonymDefinition}`);
    let difference = `“${metadata?.word || term}”重点是“${definitionTranslation || shortMeaning}”；“${word}”更偏向“${synonymDefinition || synonymMeaning || word}”。两者不是所有句子都能直接替换。`;
    if (mainFinancial && !synonymFinancial) {
      difference = `它不是“${metadata?.word || term}”在付款语境下的同义词。“${metadata?.word || term}”表示汇款；“${word}”表示“${synonymDefinition || synonymMeaning || word}”，外贸付款邮件中不要互换。`;
    } else if (term.toLowerCase() === 'remittance' && synonymFinancial) {
      difference = `意思接近，但“${word}”在现代外贸付款沟通中较少使用。向客户说明汇款、定金或尾款时优先使用“remittance”。`;
    }
    return {
      word,
      meaning: synonymDefinition || synonymMeaning,
      type: relatedMetadata[index]?.type || 'word / phrase',
      definition: relatedMetadata[index]?.definition || '',
      useWhen: `当你要表达“${synonymDefinition || synonymMeaning || word}”时使用。`,
      difference
    };
  });
  const grammar = getPartOfSpeechGuide(isSentence ? 'sentence' : (metadata?.type || 'word / phrase'));
  const usage = getUsageGuide(term, meaning, context, definitionTranslation);

  return {
    word: metadata?.word || term,
    ipa: metadata?.ipa ? `/${metadata.ipa}/` : (isSentence ? '整句' : '/语音可播放/'),
    type: isSentence ? 'sentence' : (metadata?.type || 'word / phrase'),
    meaning,
    definition: metadata?.definition || '',
    phrase: metadata?.definition ? `${metadata.definition}（英文释义）` : `${term} ${shortMeaning}`,
    example,
    translation: exampleTranslation || shortMeaning,
    related,
    grammar,
    usage,
    category: contextLabels[context] || contextLabels.trade,
    source: '在线词典',
    updatedAt: new Date().toISOString()
  };
}

export { contextLabels };
