export const tokenizeEnglish = text => String(text || '').match(/[A-Za-z]+(?:['’-][A-Za-z]+)*|[^A-Za-z]+/g) || [];

export const normalizeEnglishWord = token => String(token || '')
  .replace(/[’]/g, "'")
  .replace(/^'+|'+$/g, '')
  .trim();
