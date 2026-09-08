// CSS length conversion around a base (root) font size.
// px is the pivot. rem is relative to the root font size; em and % are relative
// to the local (parent) font size; pt is the CSS point: 1pt = 96/72 px.

export type Unit = 'px' | 'rem' | 'em' | 'pt' | 'percent';

export const UNITS: { id: Unit; label: string; symbol: string }[] = [
  { id: 'px', label: 'Pixels', symbol: 'px' },
  { id: 'rem', label: 'Root em', symbol: 'rem' },
  { id: 'em', label: 'Em', symbol: 'em' },
  { id: 'pt', label: 'Points', symbol: 'pt' },
  { id: 'percent', label: 'Percent', symbol: '%' },
];

const PT_PER_PX = 72 / 96;

export function toPx(value: number, from: Unit, root: number, local: number): number {
  switch (from) {
    case 'px':
      return value;
    case 'rem':
      return value * root;
    case 'em':
      return value * local;
    case 'pt':
      return value / PT_PER_PX;
    case 'percent':
      return (value / 100) * local;
  }
}

export function fromPx(px: number, root: number, local: number): Record<Unit, number> {
  return {
    px,
    rem: root === 0 ? NaN : px / root,
    em: local === 0 ? NaN : px / local,
    pt: px * PT_PER_PX,
    percent: local === 0 ? NaN : (px / local) * 100,
  };
}

export interface ConvertResult {
  px: number;
  values: Record<Unit, number>;
}

export function convert(
  value: number,
  from: Unit,
  root: number,
  local: number,
): ConvertResult | null {
  if (!Number.isFinite(value) || !Number.isFinite(root) || !Number.isFinite(local)) return null;
  if (root <= 0 || local <= 0) return null;
  const px = toPx(value, from, root, local);
  return { px, values: fromPx(px, root, local) };
}

// Trim to at most `dp` decimals but drop trailing zeros: 1.5, 0.625, 16
export function fmt(n: number, dp = 4): string {
  if (!Number.isFinite(n)) return '—';
  const r = Math.round(n * 10 ** dp) / 10 ** dp;
  return String(r);
}

// Common pixel sizes for the quick-reference table.
export const COMMON_PX = [1, 2, 4, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 64, 80, 96];
