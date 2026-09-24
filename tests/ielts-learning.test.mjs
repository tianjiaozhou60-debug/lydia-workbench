import test from 'node:test';
import assert from 'node:assert/strict';
import { contextParagraphSets, getIeltsWord, ieltsVocabulary } from '../src/ielts-content.js';
import { mergeIeltsState } from '../src/ielts-sync.js';
import { speakText } from '../src/speech.js';
import { agriculturalLightingVocabulary, findAgriculturalVocabularyMatches } from '../src/business-english.js';

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
    taskOffsets: { listening: 2 }, reviewWords: ['integrate'], knownWords: []
  }, {
    minutesByDay: { '2026-09-21': 40 }, checkins: { '2026-09-21': ['reading'] },
    taskOffsets: { reading: 1 }, reviewWords: ['enhance'], knownWords: ['substantial']
  });
  assert.equal(merged.minutesByDay['2026-09-21'], 40);
  assert.deepEqual(new Set(merged.checkins['2026-09-21']), new Set(['reading', 'listening']));
  assert.deepEqual(merged.taskOffsets, { reading: 1, listening: 2 });
  assert.deepEqual(new Set(merged.reviewWords), new Set(['enhance', 'integrate']));
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
  globalThis.window = { speechSynthesis: {
    getVoices: () => [{ lang: 'en-GB', name: 'English' }],
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
  delete globalThis.window;
  delete globalThis.SpeechSynthesisUtterance;
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
