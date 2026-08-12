import { Platform } from 'react-native';

/**
 * Design tokens for Glow Lash Studio.
 * Palette values come from docs/brand-identity.md and must not drift.
 */

export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  heading: string;
  muted: string;
  accent: string;
  accentDeep: string;
  blush: string;
  border: string;
  danger: string;
  success: string;
  onAccent: string;
}

export const lightPalette: Palette = {
  background: '#FAF7F2', // Ivory
  surface: '#FFFFFF',
  surfaceAlt: '#F2ECE3', // Porcelain
  text: '#443C35', // Ink
  heading: '#2B2521', // Espresso
  muted: '#857A6E', // Stone
  accent: '#C9A96A', // Champagne
  accentDeep: '#A88547', // Champagne Deep — AA small text on light
  blush: '#E8D5CC',
  border: '#E6DFD3',
  danger: '#9C4A3C',
  success: '#5F7355',
  onAccent: '#2B2521',
};

export const darkPalette: Palette = {
  background: '#1C1916',
  surface: '#262119',
  surfaceAlt: '#2E2820',
  text: '#F2ECE3',
  heading: '#F2ECE3',
  muted: '#A99C8C',
  accent: '#D9BC85',
  accentDeep: '#C9A96A',
  blush: '#4A3E36',
  border: '#3A332A',
  danger: '#C8776A',
  success: '#93A886',
  onAccent: '#1C1916',
};

/** 4pt-based spacing scale. Generous by default — the brand breathes. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Subtle radii per art direction (4px base). */
export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

/**
 * Type scale. Display sizes use the platform serif as a stand-in for
 * Cormorant Garamond (load the real face via expo-font in production).
 */
export const fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }) as string,
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }) as string,
} as const;

export const typeScale = {
  display: { fontSize: 34, lineHeight: 40, fontFamily: fonts.serif, fontWeight: '600' as const },
  title: { fontSize: 26, lineHeight: 32, fontFamily: fonts.serif, fontWeight: '600' as const },
  heading: { fontSize: 20, lineHeight: 26, fontFamily: fonts.serif, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22, fontFamily: fonts.sans, fontWeight: '400' as const },
  small: { fontSize: 13, lineHeight: 18, fontFamily: fonts.sans, fontWeight: '400' as const },
  /** Letter-spaced uppercase label — brand "eyebrow" style. */
  label: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fonts.sans,
    fontWeight: '500' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
} as const;

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  palette: Palette;
  spacing: typeof spacing;
  radii: typeof radii;
  fonts: typeof fonts;
  typeScale: typeof typeScale;
  isDark: boolean;
}
