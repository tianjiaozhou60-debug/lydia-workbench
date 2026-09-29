export const selectPreferredVoice = (voices, lang = 'en-GB') => {
  const requested = lang.toLowerCase();
  const language = requested.split('-')[0];
  const candidates = (voices || []).filter(voice => voice.lang?.toLowerCase().startsWith(language));
  const score = voice => {
    const name = String(voice.name || '').toLowerCase();
    const voiceLang = String(voice.lang || '').toLowerCase();
    return (voiceLang === requested ? 40 : 0)
      + (name.includes('google') ? 30 : 0)
      + (name.includes('uk english') || name.includes('great britain') ? 12 : 0)
      + (voice.localService ? 2 : 0);
  };
  return candidates.sort((a, b) => score(b) - score(a))[0];
};

export function speakText(text, { lang = 'en-GB', rate = 0.86, onError } = {}) {
  if (!text?.trim()) return false;
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    onError?.('当前浏览器不支持语音播放');
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;
  const voice = selectPreferredVoice(window.speechSynthesis.getVoices(), lang);
  if (voice) utterance.voice = voice;
  utterance.onerror = event => {
    if (event.error !== 'interrupted' && event.error !== 'canceled') {
      onError?.('发音播放失败，请检查手机的媒体音量');
    }
  };
  window.speechSynthesis.speak(utterance);
  return true;
}
