import fs from 'node:fs/promises';

const endpoint = 'https://www.jikeshuoyasi.com/api/blade-app/exam-real/v1/list';
const subjects = ['listening', 'reading', 'writing', 'speaking'];
const catalog = { source: '即刻说雅思', sourceUrl: 'https://www.jikeshuoyasi.com/exam-real-questions', updatedAt: new Date().toISOString(), subjects: {} };

for (const subject of subjects) {
  const records = [];
  let page = 1;
  let total = Infinity;
  let subjectLabel = subject;
  let filters = {};

  while (records.length < total) {
    const url = new URL(endpoint);
    url.search = new URLSearchParams({ subject, page: String(page), pageSize: '50' });
    const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'Lydia-Workbench-Catalog/1.0' } });
    if (!response.ok) throw new Error(`${subject}: ${response.status}`);
    const payload = await response.json();
    const data = payload.data;
    if (!payload.success || !data) throw new Error(`${subject}: invalid response`);
    total = Number(data.total || 0);
    subjectLabel = data.subjectLabel || subjectLabel;
    filters = data.filters || filters;
    records.push(...(data.records || []).map(item => ({
      id: item.id, subject: item.subject, title: item.title,
      part: item.partLabel || item.writingKindLabel || '', types: item.typeLabels || [],
      scene: item.scene || '', hitTime: item.hitTime || '',
      difficulty: Number(item.newDifficulty ?? -1), practitioners: Number(item.practitionersNumber ?? -1),
      accuracy: Number(item.perAccuracy ?? -1), sourceCode: item.sourceCode || 'xiexiu',
      paperId: String(item.paperId || ''),
      originalUrl: `https://www.jikeshuoyasi.com/exam-real-questions?subject=${encodeURIComponent(item.subject)}&sourceCode=${encodeURIComponent(item.sourceCode || 'xiexiu')}&paperId=${encodeURIComponent(item.paperId || '')}`
    })));
    if (!data.records?.length) break;
    page += 1;
  }
  catalog.subjects[subject] = { label: subjectLabel, total, filters, records: records.slice(0, total) };
}

await fs.writeFile('public/ielts-catalog.json', `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
console.log(subjects.map(subject => `${catalog.subjects[subject].label}:${catalog.subjects[subject].records.length}`).join(' | '));
