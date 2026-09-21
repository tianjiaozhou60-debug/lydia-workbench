const preferredVoice = (lang) => {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  const exact = voices.find(voice => voice.lang.toLowerCase() === lang.toLowerCase());
  const language = lang.split('-')[0].toLowerCase();
  return exact || voices.find(voice => voice.lang.toLowerCase().startsWith(language));
};

export function speakText(text, { lang = 'en-GB', rate = 0.82, onError } = {}) {
  if (!text?.trim()) return false;
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    onError?.('当前浏览器不支持语音播放');
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = lang;
  utterance.rate = rate;
  const voice = preferredVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.onerror = event => {
    if (event.error !== 'interrupted' && event.error !== 'canceled') {
      onError?.('发音播放失败，请检查手机的媒体音量');
    }
  };
  window.speechSynthesis.speak(utterance);
  return true;
}
