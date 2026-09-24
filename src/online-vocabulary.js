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

  const secondaryTexts = [metadata?.definition, example, ...relatedWords];
  const translated = await Promise.allSettled(secondaryTexts.map(value => translate(value)));
  const [definitionTranslation, exampleTranslation, ...relatedTranslations] = translated.map(result =>
    result.status === 'fulfilled' ? clean(result.value) : ''
  );
  const meaning = definitionTranslation && definitionTranslation !== shortMeaning
    ? `${shortMeaning}；${definitionTranslation}`
    : shortMeaning;
  const related = relatedWords.map((word, index) =>
    relatedTranslations[index] ? `${word} ${relatedTranslations[index]}` : word
  );

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
    category: contextLabels[context] || contextLabels.trade,
    source: '在线词典',
    updatedAt: new Date().toISOString()
  };
}

export { contextLabels };
