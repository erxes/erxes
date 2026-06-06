import { IWidgetUiOptions } from '../app/messenger/types/connection';

// Type definitions
interface OKLCHColor {
  lightness: number; // 0-1
  chroma: number; // 0-0.4 typically
  hue: number; // 0-360 degrees
}

// Fallback OKLCH value for primary-foreground when calculation fails
const DEFAULT_PRIMARY_FOREGROUND = 'oklch(0.9848 0 0)';

/**
 * Color utility class for handling color conversions and manipulations
 */
class ColorUtils {
  /**
   * Convert hex color to OKLCH values for CSS custom properties
   */
  static hexToOklch(hex: string): OKLCHColor {
    const cleanHex = hex.replace('#', '');
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      throw new Error(`Invalid hex color format: ${hex}`);
    }

    // Parse hex to RGB (0-1 range)
    const r = Number.parseInt(cleanHex.substr(0, 2), 16) / 255;
    const g = Number.parseInt(cleanHex.substr(2, 2), 16) / 255;
    const b = Number.parseInt(cleanHex.substr(4, 2), 16) / 255;

    // Convert RGB to Linear RGB
    const linearR =
      r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const linearG =
      g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const linearB =
      b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    // Convert Linear RGB to XYZ (sRGB D65)
    const x = 0.4124564 * linearR + 0.3575761 * linearG + 0.1804375 * linearB;
    const y = 0.2126729 * linearR + 0.7151522 * linearG + 0.072175 * linearB;
    const z = 0.0193339 * linearR + 0.119192 * linearG + 0.9503041 * linearB;

    // XYZ to linear LMS
    const l = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
    const m = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
    const s = 0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z;

    // Cube root
    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);

    // OKLab
    const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
    const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
    const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

    // OKLab → OKLCH
    const C = Math.sqrt(a * a + b_ * b_);
    let h = Math.atan2(b_, a) * (180 / Math.PI);
    if (h < 0) h += 360;

    return { lightness: L, chroma: C, hue: h };
  }

  static oklchToString(oklch: OKLCHColor): string {
    return `oklch(${oklch.lightness.toFixed(4)} ${oklch.chroma.toFixed(
      4,
    )} ${oklch.hue.toFixed(2)})`;
  }

  /**
   * Returns bare OKLCH channel values (no oklch() wrapper).
   * Use this for --primary since the theme does: oklch(var(--primary)).
   */
  static oklchToChannels(oklch: OKLCHColor): string {
    return `${oklch.lightness.toFixed(4)} ${oklch.chroma.toFixed(
      4,
    )} ${oklch.hue.toFixed(2)}`;
  }

  /**
   * Calculate relative luminance to determine contrast
   */
  static getLuminance(hex: string): number {
    const cleanHex = hex.replace('#', '');
    const r = Number.parseInt(cleanHex.substr(0, 2), 16) / 255;
    const g = Number.parseInt(cleanHex.substr(2, 2), 16) / 255;
    const b = Number.parseInt(cleanHex.substr(4, 2), 16) / 255;
    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
    );
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Return black or white hex depending on background luminance
   */
  static getContrastColor(hex: string): string {
    return this.getLuminance(hex) > 0.5 ? '#000000' : '#ffffff';
  }

  /**
   * Returns true if the value is a 3- or 6-digit hex color (with or without #).
   */
  static isHexColor(value: string): boolean {
    return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());
  }

  /**
   * Expands shorthand #rgb to #rrggbb. Returns the value unchanged if already 6 digits.
   */
  static expandHex(hex: string): string {
    const clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      return (
        '#' +
        clean
          .split('')
          .map((c) => c + c)
          .join('')
      );
    }
    return hex.startsWith('#') ? hex : '#' + hex;
  }
}

/**
 * Tailwind CSS utilities for dynamic theming.
 * Only --primary and --primary-foreground are set; everything else
 * is left to the core UI theme.
 */
export class TailwindThemeManager {
  private root: HTMLElement;

  constructor() {
    this.root = document.documentElement;
  }

  /**
   * Apply uiOptions — sets only --primary and --primary-foreground.
   * All other CSS variables remain controlled by the core UI theme.
   */
  applyUiOptions(uiOptions: IWidgetUiOptions): void {
    if (!uiOptions) return;

    const primaryValue = uiOptions.primary?.DEFAULT;
    const foregroundValue = uiOptions.primary?.foreground;

    if (primaryValue) {
      this.applyPrimaryColors(primaryValue, foregroundValue);
    } else {
      // No custom primary supplied — remove any previously injected overrides
      this.removeCustomProperty('--primary');
      this.removeCustomProperty('--primary-foreground');
    }

    // Logo
    if (uiOptions.logo) {
      this.setCustomProperty('--widget-logo', `url(${uiOptions.logo})`);
    } else {
      this.removeCustomProperty('--widget-logo');
    }
  }

  /**
   * Set --primary and --primary-foreground only.
   * Accepts any CSS color value: hex (#rrggbb), oklch(), hsl(), rgb(), etc.
   * Hex values are converted to OKLCH; other formats are used as-is.
   */
  private applyPrimaryColors(
    primaryValue: string,
    foregroundValue?: string,
  ): void {
    // -- primary --
    // Theme rule: --color-primary: oklch(var(--primary))
    // So --primary must be bare channel values "L C H", not oklch(L C H).
    if (ColorUtils.isHexColor(primaryValue)) {
      try {
        const expanded = ColorUtils.expandHex(primaryValue);
        const primaryOklch = ColorUtils.hexToOklch(expanded);
        this.setCustomProperty(
          '--primary',
          ColorUtils.oklchToChannels(primaryOklch),
        );
      } catch {
        // Invalid hex — leave the CSS variable untouched
        return;
      }
    } else {
      // Non-hex: if it's already oklch(L C H), strip the wrapper since
      // --color-primary: oklch(var(--primary)) will re-apply it.
      const channelMatch = primaryValue.match(/^oklch\((.+)\)$/i);
      this.setCustomProperty(
        '--primary',
        channelMatch ? channelMatch[1] : primaryValue,
      );
    }

    // -- primary-foreground --
    if (foregroundValue) {
      if (ColorUtils.isHexColor(foregroundValue)) {
        try {
          const expanded = ColorUtils.expandHex(foregroundValue);
          const fgOklch = ColorUtils.hexToOklch(expanded);
          this.setCustomProperty(
            '--primary-foreground',
            ColorUtils.oklchToString(fgOklch),
          );
        } catch {
          this.setCustomProperty(
            '--primary-foreground',
            DEFAULT_PRIMARY_FOREGROUND,
          );
        }
      } else {
        // Non-hex CSS value — use directly
        this.setCustomProperty('--primary-foreground', foregroundValue);
      }
    } else if (ColorUtils.isHexColor(primaryValue)) {
      // No foreground provided but primary is hex — calculate contrast
      try {
        const contrastHex = ColorUtils.getContrastColor(
          ColorUtils.expandHex(primaryValue),
        );
        const expanded = ColorUtils.expandHex(contrastHex);
        const fgOklch = ColorUtils.hexToOklch(expanded);
        this.setCustomProperty(
          '--primary-foreground',
          ColorUtils.oklchToString(fgOklch),
        );
      } catch {
        this.setCustomProperty(
          '--primary-foreground',
          DEFAULT_PRIMARY_FOREGROUND,
        );
      }
    } else {
      // Non-hex primary with no foreground — fall back to default
      this.setCustomProperty(
        '--primary-foreground',
        DEFAULT_PRIMARY_FOREGROUND,
      );
    }
  }

  private setCustomProperty(property: string, value: string): void {
    this.root.style.setProperty(property, value);
  }

  private removeCustomProperty(property: string): void {
    this.root.style.removeProperty(property);
  }

  /**
   * Remove the primary overrides so the core theme takes over again.
   */
  resetToDefaults(): void {
    this.removeCustomProperty('--primary');
    this.removeCustomProperty('--primary-foreground');
    this.removeCustomProperty('--widget-logo');
  }
}

// Singleton instance
const themeManager = new TailwindThemeManager();

export const applyUiOptionsToTailwind = (uiOptions: IWidgetUiOptions): void => {
  themeManager.applyUiOptions(uiOptions);
};

export const resetTailwindToDefaults = (): void => {
  themeManager.resetToDefaults();
};

// Export for advanced usage
export { ColorUtils };
