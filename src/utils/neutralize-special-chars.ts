const SPECIAL_CHARS: string = '^$\\-()[]?*+./';

export function neutralizeSpecialChars(chars: string): string {
  let safeChars: string = '';

  for (let i = 0; i < chars.length; i++)
    if (SPECIAL_CHARS.includes(chars[i])) safeChars += '\\' + chars[i];
    else safeChars += chars[i];

  return safeChars;
}
