import { IWidgetUiOptions } from '../app/messenger/types/connection';

// Type definitions for better type safety
interface OKLCHColor {
  lightness: number; // 0-1
  chroma: number; // 0-0.4 typically
  hue: number; // 0-360 degrees
}

interface ColorAdjustments {
  lightness?: number;
  chroma?: number;
  hue?: number;
}

interface TailwindClasses {
  primary: string;
  'primary-foreground': string;
  accent: string;
  'accent-foreground': string;
  muted: string;
  'muted-foreground': string;
}

// Default color values for fallbacks (OKLCH format)
const DEFAULT_COLORS = {
  primary: 'oklch(0.514 0.2276 276.98)',
  'primary-foreground': 'oklch(0.9848 0 0)',
  foreground: 'oklch(0.2102 0.006 285.87)',
  accent: 'oklch(0.9688 0.0008 286.38)',
  'accent-foreground': 'oklch(0.7258 0.0074 286.21)',
  muted: 'oklch(0.9619 0 0)',
  'muted-foreground': 'oklch(0.5509 0.0057 17.33)',
  input: 'oklch(0.9197 0.0041 286.32)',
  border: 'oklch(0.9197 0.0041 286.32)',
  ring: 'oklch(0.5146 0.2296 277.59)',
} as const;

/**
 * Color utility class for handling color conversions and manipulations
 */
class ColorUtils {
  /**
   * Convert hex color to OKLCH values for CSS custom properties
   * Based on the OKLCH color space for better perceptual uniformity
   */
  static hexToOklch(hex: string): OKLCHColor {
    // Remove # if present and validate format
    const cleanHex = hex.replace('#', '');
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      throw new Error(`Invalid hex color format: ${hex}`);
    }

    // Parse hex to RGB (0-1 range)
    const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
    const b = parseInt(cleanHex.substr(4, 2), 16) / 255;

    // Convert RGB to Linear RGB (sRGB to linear)
    const linearR = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const linearG = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const linearB = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    // Convert Linear RGB to XYZ (sRGB to XYZ D65 matrix)
    const x = 0.4124564 * linearR + 0.3575761 * linearG + 0.1804375 * linearB;
    const y = 0.2126729 * linearR + 0.7151522 * linearG + 0.0721750 * linearB;
    const z = 0.0193339 * linearR + 0.1191920 * linearG + 0.9503041 * linearB;

    // Convert XYZ to OKLab
    // First convert XYZ to linear LMS (using OKLab's forward matrix)
    const l = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
    const m = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
    const s = 0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z;

    // Apply cube root (non-linear transformation)
    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);

    // Convert to OKLab
    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

    // Convert OKLab to OKLCH
    const C = Math.sqrt(a * a + b_ * b_);
    let h = Math.atan2(b_, a) * (180 / Math.PI);
    if (h < 0) h += 360;

    return {
      lightness: L,
      chroma: C,
      hue: h,
    };
  }

  /**
   * Convert OKLCHColor to CSS OKLCH string
   */
  static oklchToString(oklch: OKLCHColor): string {
    return `oklch(${oklch.lightness.toFixed(4)} ${oklch.chroma.toFixed(4)} ${oklch.hue.toFixed(2)})`;
  }

  /**
   * Calculate luminance of a color to determine contrast
   */
  static getLuminance(hex: string): number {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
    const b = parseInt(cleanHex.substr(4, 2), 16) / 255;

    // Apply gamma correction
    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Adjust OKLCH values for creating color variations
   */
  static adjustOklch(oklch: OKLCHColor, adjustments: ColorAdjustments): OKLCHColor {
    return {
      lightness: adjustments.lightness ?? oklch.lightness,
      chroma: adjustments.chroma ?? oklch.chroma,
      hue: adjustments.hue ?? oklch.hue,
    };
  }

  /**
   * Get contrasting color (black or white) based on luminance
   */
  static getContrastColor(hex: string): string {
    const luminance = this.getLuminance(hex);
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
}

/**
 * Tailwind CSS utilities for dynamic theming
 */
export class TailwindThemeManager {
  private root: HTMLElement;

  constructor() {
    this.root = document.documentElement;
  }

  /**
   * Apply uiOptions to Tailwind CSS custom properties
   */
  applyUiOptions(uiOptions: IWidgetUiOptions): void {
    if (!uiOptions) return;

    // Apply primary colors only
    if (uiOptions.primary?.DEFAULT) {
      this.applyPrimaryColors(uiOptions.primary.DEFAULT, uiOptions.primary.foreground);
    } else {
      // If no primary color is provided, set default accent colors
      this.setDefaultAccentColors();
    }

    // Apply logo
    if (uiOptions.logo) {
      this.setCustomProperty('--widget-logo', `url(${uiOptions.logo})`);
    } else {
      this.removeCustomProperty('--widget-logo');
    }
  }

  /**
   * Apply primary color scheme
   */
  private applyPrimaryColors(primary: string, foreground?: string): void {
    if (!primary) return;

    let primaryOklch: OKLCHColor | null = null;

    // Set primary color - handle errors separately
    try {
      primaryOklch = ColorUtils.hexToOklch(primary);
      const primaryOklchString = ColorUtils.oklchToString(primaryOklch);
      this.setCustomProperty('--primary', primaryOklchString);
    } catch (error) {
      // Primary color conversion failed - cannot proceed without primary
      this.setDefaultAccentColors();
      return;
    }

    // Set primary foreground - handle errors separately from primary
    try {
      // Use provided foreground or calculate contrast color
      const primaryForeground = foreground || ColorUtils.getContrastColor(primary);
      const primaryForegroundOklch = ColorUtils.hexToOklch(primaryForeground);
      this.setCustomProperty('--primary-foreground', ColorUtils.oklchToString(primaryForegroundOklch));
    } catch (error) {
      // Foreground conversion failed - fallback to contrast color if not provided
      if (!foreground) {
        // This shouldn't happen as getContrastColor always returns valid hex
        // But if it does, use default
        this.setCustomProperty('--primary-foreground', DEFAULT_COLORS['primary-foreground']);
      } else {
        // Provided foreground is invalid - calculate contrast instead
        try {
          const contrastColor = ColorUtils.getContrastColor(primary);
          const contrastOklch = ColorUtils.hexToOklch(contrastColor);
          this.setCustomProperty('--primary-foreground', ColorUtils.oklchToString(contrastOklch));
        } catch {
          // Last resort: use default
          this.setCustomProperty('--primary-foreground', DEFAULT_COLORS['primary-foreground']);
        }
      }
    }

    // Generate accent colors if we have a primary color
    if (primaryOklch) {
      this.generateAccentColors(primaryOklch);
    } else {
      // Fallback to default accent colors if primary color processing failed
      this.setDefaultAccentColors();
    }
  }

  /**
   * Generate accent colors based on primary color
   */
  private generateAccentColors(primaryOklch: OKLCHColor): void {
    // Soft, very light accent - maintain primary hue but with reduced chroma for softness
    // Increase lightness significantly and reduce chroma to create a soft, pastel version
    const accentOklch = ColorUtils.adjustOklch(primaryOklch, {
      lightness: 0.96, // Very light
      chroma: Math.max(0.01, primaryOklch.chroma * 0.15), // Softened chroma (15% of original)
      hue: primaryOklch.hue, // Maintain the same hue (e.g., blue stays blue)
    });
    this.setCustomProperty('--accent', ColorUtils.oklchToString(accentOklch));

    // Accent foreground - darker but still soft, maintains primary hue
    const accentForegroundOklch = ColorUtils.adjustOklch(primaryOklch, {
      lightness: 0.30, // Dark enough for contrast
      chroma: Math.max(0.05, primaryOklch.chroma * 0.3), // Softened but visible
      hue: primaryOklch.hue, // Maintain the same hue
    });
    this.setCustomProperty('--accent-foreground', ColorUtils.oklchToString(accentForegroundOklch));
  }

  /**
   * Set default accent colors when no primary color is provided
   */
  private setDefaultAccentColors(): void {
    this.setCustomProperty('--accent', DEFAULT_COLORS.accent);
    this.setCustomProperty('--accent-foreground', DEFAULT_COLORS['accent-foreground']);
  }

  /**
   * Set common color variables that are frequently used
   */
  private setCommonColorVariables(uiOptions: IWidgetUiOptions): void {
    // Set muted colors based on primary or use defaults
    if (uiOptions.primary?.DEFAULT) {
      try {
        const primaryOklch = ColorUtils.hexToOklch(uiOptions.primary.DEFAULT);
        
        // Generate muted colors from primary
        const mutedOklch = ColorUtils.adjustOklch(primaryOklch, { lightness: 0.96, chroma: 0.001 });
        this.setCustomProperty('--muted', ColorUtils.oklchToString(mutedOklch));
        
        const mutedForegroundOklch = ColorUtils.adjustOklch(primaryOklch, { lightness: 0.55, chroma: 0.001 });
        this.setCustomProperty('--muted-foreground', ColorUtils.oklchToString(mutedForegroundOklch));
        
        // Set foreground based on primary or use default
        const foregroundOklch = ColorUtils.adjustOklch(primaryOklch, { lightness: 0.21, chroma: 0.006 });
        this.setCustomProperty('--foreground', ColorUtils.oklchToString(foregroundOklch));
        
        // Set input background - very light version of primary
        const inputOklch = ColorUtils.adjustOklch(primaryOklch, { lightness: 0.92, chroma: 0.004 });
        this.setCustomProperty('--input', ColorUtils.oklchToString(inputOklch));
        
        // Set border color - light version of primary
        const borderOklch = ColorUtils.adjustOklch(primaryOklch, { lightness: 0.92, chroma: 0.004 });
        this.setCustomProperty('--border', ColorUtils.oklchToString(borderOklch));
        
        // Set ring color - same as primary
        this.setCustomProperty('--ring', ColorUtils.oklchToString(primaryOklch));
        
      } catch (error) {
        // Error generating colors - use defaults
        this.setDefaultCommonColors();
      }
    } else {
      this.setDefaultCommonColors();
    }
  }

  /**
   * Set default common color values
   */
  private setDefaultCommonColors(): void {
    this.setCustomProperty('--muted', DEFAULT_COLORS.muted);
    this.setCustomProperty('--muted-foreground', DEFAULT_COLORS['muted-foreground']);
    this.setCustomProperty('--foreground', DEFAULT_COLORS.foreground);
    this.setCustomProperty('--input', DEFAULT_COLORS.input);
    this.setCustomProperty('--border', DEFAULT_COLORS.border);
    this.setCustomProperty('--ring', DEFAULT_COLORS.ring);
  }

  /**
   * Set a CSS custom property
   */
  private setCustomProperty(property: string, value: string): void {
    this.root.style.setProperty(property, value);
  }

  /**
   * Remove a CSS custom property
   */
  private removeCustomProperty(property: string): void {
    this.root.style.removeProperty(property);
  }

  /**
   * Reset all custom properties to default values
   */
  resetToDefaults(): void {
    Object.entries(DEFAULT_COLORS).forEach(([key, value]) => {
      this.setCustomProperty(`--${key}`, value);
    });

    // Remove widget-specific properties
    this.removeCustomProperty('--widget-logo');
  }

  /**
   * Generate Tailwind classes dynamically based on uiOptions
   */
  generateClasses(uiOptions: IWidgetUiOptions): TailwindClasses {
    const classes: TailwindClasses = {
      primary: 'bg-primary',
      'primary-foreground': 'text-primary-foreground',
      accent: 'bg-accent',
      'accent-foreground': 'text-accent-foreground',
      muted: 'bg-muted',
      'muted-foreground': 'text-muted-foreground',
    };

    if (uiOptions.primary?.DEFAULT) {
      classes.primary = `bg-[${uiOptions.primary.DEFAULT}]`;
    }

    if (uiOptions.primary?.foreground) {
      classes['primary-foreground'] = `text-[${uiOptions.primary.foreground}]`;
    }

    return classes;
  }
}

// Create singleton instance
const themeManager = new TailwindThemeManager();

// Export convenience functions
export const applyUiOptionsToTailwind = (uiOptions: IWidgetUiOptions): void => {
  themeManager.applyUiOptions(uiOptions);
};

export const resetTailwindToDefaults = (): void => {
  themeManager.resetToDefaults();
};

export const generateTailwindClasses = (uiOptions: IWidgetUiOptions): TailwindClasses => {
  return themeManager.generateClasses(uiOptions);
};

// Export the class for advanced usage
export { ColorUtils };
