const PATTERNS = [
  /\[one[- ]line/i,
  /\[role\]/i,
  /\[what /i,
  /\[ADD\b/i,
  /\[name\]/i,
  /\[team\]/i,
  /\[duration\]/i,
  /\[system \d+\]/i,
  /\[project \d+\]/i,
  /\[factual/i,
  /\bTODO\b/,
  /\bTBD\b/,
];

/** @param {string} text */
export function findPlaceholders(text) {
  return PATTERNS.flatMap((p) => {
    const m = text.match(p);
    return m ? [m[0]] : [];
  });
}
