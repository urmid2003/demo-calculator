export const fmt = (n: number) =>
  '₹' + Math.round(n).toLocaleString('en-IN');

export const fmtH = (h: number) =>
  Math.round(h).toLocaleString() + 'h';

export const fmtD = (h: number) =>
  Math.round(h / 8).toLocaleString() + ' days';

export const fmtNum = (n: number) => Math.round(n).toLocaleString('en-IN');
