export const formatCount = (count: number, singl: string, plural: string = `${singl}s`) =>
  `${count} ${count === 1 ? singl : plural}`;
