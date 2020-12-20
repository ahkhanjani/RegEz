// using https://github.com/aceakash/string-similarity

export function suggest(main: string, targets: string[]): string {
  const ratings: { target: string; rating: number }[] = [];
  let bestMatchIndex: number = 0;

  for (let i = 0; i < targets.length; i++) {
    const currentTarget: string = targets[i];
    const currentRating: number = compare(main, currentTarget);
    ratings.push({ target: currentTarget, rating: currentRating });
    if (currentRating > ratings[bestMatchIndex].rating) bestMatchIndex = i;
  }

  const bestMatch = ratings[bestMatchIndex];

  return bestMatch.target;
}

function compare(a: string, b: string): number {
  // remove whitespaces
  a = a.replace(/\s+/g, '');
  b = b.replace(/\s+/g, '');

  if (a.length <= 1) return 0;
  if (a === b) return 1;

  const firstBigrams: Map<string, any> = new Map();
  for (let i = 0; i < a.length - 1; i++) {
    const bigram: string = a.substring(i, i + 2);
    const count: any = firstBigrams.has(bigram)
      ? firstBigrams.get(bigram) + 1
      : 1;

    firstBigrams.set(bigram, count);
  }

  let intersectionSize: number = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bigram: string = b.substring(i, i + 2);
    const count: any = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;

    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2.0 * intersectionSize) / (a.length + b.length - 2);
}
