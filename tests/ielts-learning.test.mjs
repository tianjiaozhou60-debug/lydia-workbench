import test from 'node:test';
import assert from 'node:assert/strict';
import { contextParagraphSets, getIeltsWord, ieltsVocabulary } from '../src/ielts-content.js';
import { mergeIeltsState } from '../src/ielts-sync.js';
import { selectPreferredVoice, speakText } from '../src/speech.js';
import { normalizeEnglishWord, tokenizeEnglish } from '../src/interactive-english.js';
import { buildIeltsSourceUrl } from '../src/ielts-source-links.js';
import { agriculturalLightingVocabulary, findAgriculturalVocabularyMatches } from '../src/business-english.js';
import { fallbackExample, getPartOfSpeechGuide, getUsageGuide, lookupOnlineVocabulary } from '../src/online-vocabulary.js';

test('every built-in IELTS study word has pronunciation and bilingual example', () => {
  const words = [
    ...ieltsVocabulary.map(item => item.word),
    ...contextParagraphSets.flatMap(group => group.flatMap(paragraph =>
      paragraph.parts.filter(Array.isArray).map(part => part[0])))
  ];
  for (const word of words) {
    const entry = getIeltsWord(word);
    assert.ok(entry, word);
    assert.match(entry.ipa, /^\/.*\/$/, word);
    assert.ok(entry.meaning, word);
    assert.ok(entry.example.includes(word), word);
    assert.ok(entry.translation, word);
  }
  assert.equal(getIeltsWord('dearth of').ipa, '/dɜːθ əv/');
});

test('learning progress merges non-overlapping work on two devices', () => {
  const merged = mergeIeltsState('ielts_learning', {
    minutesByDay: { '2026-09-21': 25 }, checkins: { '2026-09-21': ['listening'] },
    taskOffsets: { listening: 2 }, reviewWords: ['integrate'], reviewEntries: { integrate: { word: 'integrate', meaning: '整合' } }, knownWords: []
  }, {
    minutesByDay: { '2026-09-21': 40 }, checkins: { '2026-09-21': ['reading'] },
    taskOffsets: { reading: 1 }, reviewWords: ['enhance'], knownWords: ['substantial']
  });
  assert.equal(merged.minutesByDay['2026-09-21'], 40);
  assert.deepEqual(new Set(merged.checkins['2026-09-21']), new Set(['reading', 'listening']));
  assert.deepEqual(merged.taskOffsets, { reading: 1, listening: 2 });
  assert.deepEqual(new Set(merged.reviewWords), new Set(['enhance', 'integrate']));
  assert.equal(merged.reviewEntries.integrate.meaning, '整合');
});

test('exam progress uses the newest item timestamp', () => {
  const merged = mergeIeltsState('ielts_catalog_progress', {
    a: { status: 'completed', updatedAt: '2026-09-21T10:00:00Z' }
  }, {
    a: { status: 'active', updatedAt: '2026-09-21T09:00:00Z' },
    b: { status: 'completed', updatedAt: '2026-09-21T09:00:00Z' }
  });
  assert.equal(merged.a.status, 'completed');
  assert.equal(merged.b.status, 'completed');
  assert.equal(mergeIeltsState('ielts_context_offset', 2, 4), 4);
});

test('word and sentence playback uses the device English voice', () => {
  const spoken = [];
  const voices = [
    { lang: 'en-GB', name: 'Microsoft English' },
    { lang: 'en-GB', name: 'Google UK English Female' }
  ];
  globalThis.window = { speechSynthesis: {
    getVoices: () => voices,
    cancel: () => {},
    speak: utterance => spoken.push(utterance)
  }, SpeechSynthesisUtterance: true };
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };
  assert.equal(speakText('substantial'), true);
  assert.equal(speakText('The project requires a substantial initial investment.'), true);
  assert.deepEqual(spoken.map(item => item.text), [
    'substantial', 'The project requires a substantial initial investment.'
  ]);
  assert.ok(spoken.every(item => item.lang === 'en-GB' && item.voice?.lang === 'en-GB'));
  assert.equal(selectPreferredVoice(voices).name, 'Google UK English Female');
  delete globalThis.window;
  delete globalThis.SpeechSynthesisUtterance;
});

test('every English word in a paragraph can be tokenized for lookup', () => {
  const tokens = tokenizeEnglish("Technology-driven learning shouldn't stop at highlighted words.");
  const words = tokens.map(normalizeEnglishWord).filter(value => /^[A-Za-z]/.test(value));
  assert.deepEqual(words, ['Technology-driven', 'learning', "shouldn't", 'stop', 'at', 'highlighted', 'words']);
});

test('speaking records use the dedicated speaking route', () => {
  const url = new URL(buildIeltsSourceUrl({
    subject: 'speaking', sourceCode: 'xiexiu', paperId: '723', oralMaterialsId: '723', partCode: 'part1'
  }));
  assert.equal(url.pathname, '/exam-real-questions/speaking');
  assert.equal(url.searchParams.get('oralMaterialsId'), '723');
  assert.equal(url.searchParams.get('partCode'), 'part1');
  assert.equal(url.searchParams.has('paperId'), false);
});

test('agricultural lighting vocabulary is complete and searchable from pasted copy', () => {
  assert.ok(agriculturalLightingVocabulary.length >= 35);
  for (const item of agriculturalLightingVocabulary) {
    assert.ok(item.word, 'word');
    assert.match(item.ipa, /^\/.*\/$/, item.word);
    assert.ok(item.meaning, item.word);
    assert.ok(item.phrase, item.word);
    assert.ok(item.example, item.word);
    assert.ok(item.translation, item.word);
    assert.ok(item.related.length >= 2, item.word);
  }
  const matches = findAgriculturalVocabularyMatches(
    'Clear visibility of spray mist and spray patterns helps avoid over-spraying and pesticide waste.'
  );
  assert.deepEqual(matches.map(item => item.word), ['spray mist', 'spray pattern', 'over-spraying', 'pesticide waste']);
  assert.equal(findAgriculturalVocabularyMatches('thermal conductivity')[0].word, 'thermal conductivity');
});

test('business vocabulary sync merges custom words, saved items and newest progress', () => {
  const merged = mergeIeltsState('saved_vocabulary', {
    customWords: [{ word: 'sprayer', meaning: '喷雾机', updatedAt: '2026-09-23T10:00:00Z' }],
    savedWords: ['sprayer boom'],
    progress: { 'sprayer boom': { level: 2, updatedAt: '2026-09-23T10:00:00Z' } }
  }, {
    customWords: [{ word: 'sprayer', meaning: '旧释义', updatedAt: '2026-09-22T10:00:00Z' }],
    savedWords: ['spray mist'],
    progress: { 'sprayer boom': { level: 1, updatedAt: '2026-09-22T10:00:00Z' } }
  });
  assert.equal(merged.customWords[0].meaning, '喷雾机');
  assert.deepEqual(new Set(merged.savedWords), new Set(['sprayer boom', 'spray mist']));
  assert.equal(merged.progress['sprayer boom'].level, 2);
});

test('online vocabulary lookup builds a complete bilingual study card', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => {
    const value = String(url);
    if (value.includes('api.datamuse.com') && value.includes('rel_syn')) {
      return { ok: true, json: async () => [{ word: 'gathering' }, { word: 'meeting' }] };
    }
    if (value.includes('api.datamuse.com')) {
      return { ok: true, json: async () => [{ word: 'reunion', tags: ['query', 'n', 'ipa_pron:riˈunjʌn'], defs: ['n\tA meeting of people after time apart.'] }] };
    }
    if (value.includes('api.tatoeba.org')) {
      return { ok: true, json: async () => ({ data: [{ text: 'Our family reunion takes place every summer.' }] }) };
    }
    const query = new URL(value).searchParams.get('q');
    const translations = {
      reunion: '重聚',
      'A meeting of people after time apart.': '人们分别一段时间后的聚会。',
      'Our family reunion takes place every summer.': '我们的家庭聚会每年夏天举行。',
      gathering: '聚会',
      meeting: '会面'
    };
    return { ok: true, json: async () => ({ responseData: { translatedText: translations[query] || query } }) };
  };
  try {
    const item = await lookupOnlineVocabulary('reunion', 'ielts');
    assert.equal(item.ipa, '/riˈunjʌn/');
    assert.equal(item.type, 'noun');
    assert.match(item.meaning, /重聚/);
    assert.equal(item.example, 'Our family reunion takes place every summer.');
    assert.equal(item.translation, '我们的家庭聚会每年夏天举行。');
    assert.deepEqual(item.related.map(value => value.word), ['gathering', 'meeting']);
    assert.match(item.related[0].useWhen, /聚会/);
    assert.match(item.related[0].difference, /reunion/);
    assert.equal(item.grammar.label, '名词');
    assert.match(item.grammar.position, /动词/);
    assert.match(item.usage, /雅思/);
    assert.equal(item.category, '雅思英语');
  } finally {
    globalThis.fetch = originalFetch;
  }
  assert.match(fallbackExample('durable', 'adjective', 'automotive'), /durable requirement/);
});

test('part-of-speech and usage guides explain grammar in plain Chinese', () => {
  assert.equal(getPartOfSpeechGuide('noun').label, '名词');
  assert.match(getPartOfSpeechGuide('verb').plain, /动作/);
  assert.match(getPartOfSpeechGuide('adjective').position, /名词前面/);
  assert.match(getUsageGuide('remittance', '汇款', 'trade'), /定金/);
  assert.match(getUsageGuide('beam pattern', '光型', 'automotive'), /汽车LED/);
});
