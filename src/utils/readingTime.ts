const WORDS_PER_MINUTE = 200;

export const getReadingTime = (text: string) => {
  const words = text
    ? text.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  return { minutes, words };
};
