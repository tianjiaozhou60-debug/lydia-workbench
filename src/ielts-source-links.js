const sourceOrigin = 'https://www.jikeshuoyasi.com';

const speakingPartCode = item => {
  if (item?.partCode) return String(item.partCode).toLowerCase();
  const match = String(item?.part || '').match(/part\s*(\d)/i);
  return match ? `part${match[1]}` : 'part1';
};

export function buildIeltsSourceUrl(item = {}) {
  const sourceCode = item.sourceCode || 'xiexiu';
  if (item.subject === 'speaking') {
    const url = new URL('/exam-real-questions/speaking', sourceOrigin);
    url.searchParams.set('sourceCode', sourceCode);
    url.searchParams.set('partCode', speakingPartCode(item));
    url.searchParams.set('oralMaterialsId', String(item.oralMaterialsId || item.paperId || ''));
    url.searchParams.set('topNav', 'exam-real-questions');
    return url.href;
  }

  const url = new URL('/exam-real-questions', sourceOrigin);
  url.searchParams.set('subject', item.subject || 'listening');
  url.searchParams.set('sourceCode', sourceCode);
  url.searchParams.set('paperId', String(item.paperId || ''));
  return url.href;
}

export const officialSpeakingPracticeUrl = 'https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/academic/speaking';
