/**
 * Natural sort comparator so Episode 2 comes before Episode 10.
 */
export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function naturalSortFilenames(filenames: string[]): string[] {
  return [...filenames].sort(naturalCompare);
}
