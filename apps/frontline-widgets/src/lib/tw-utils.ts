import { IWidgetUiOptions } from '../app/messenger/types/connection';

// Type definitions for better type safety
interface HSLColor {
  hue: number;
  saturation: number;
  lightness: number;
}

interface ColorAdjustments {
  hue?: number;
  saturation?: number;
  lightness?: number;
}

interface TailwindClasses {
  primary: string;
  'primary-foreground': string;
  accent: string;
  'accent-foreground': string;
  muted: string;
  'muted-foreground': string;
}

// Default color values for fallbacks
const DEFAULT_COLORS = {
  primary: '244 76% 59%',
  'primary-foreground': '0 0% 100%',
  foreground: '240 6% 10%',
  accent: '240 3% 96%',
  'accent-foreground': '240 3% 66%',
  muted: '240 3% 96%',
  'muted-foreground': '0 2% 45%',
  input: '0 0% 0% / 0.05',
  border: '240 3% 90%',
  ring: '244 76% 59%',
} as const;

/**
 * Color utility class for handling color conversions and manipulations
 */
class ColorUtils {
  /**
   * Convert hex color to HSL values for CSS custom properties
   */
  static hexToHsl(hex: string): HSLColor {
    // Remove # if present and validate format
    const cleanHex = hex.replace('#', '');
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      throw new Error(`Invalid hex color format: ${hex}`);
    }

    // Parse hex values
    const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
    const b = parseInt(cleanHex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let hue: number, saturation: number, lightness: number;

    lightness = (max + min) / 2;

    if (max === min) {
      hue = saturation = 0; // achromatic
    } else {
      const delta = max - min;
      saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

      switch (max) {
        case r:
          hue = (g - b) / delta + (g < b ? 6 : 0);
          break;
        case g:
          hue = (b - r) / delta + 2;
          break;
        case b:
          hue = (r - g) / delta + 4;
          break;
        default:
          hue = 0;
      }
      hue /= 6;
    }

    return {
      hue: Math.round(hue * 360),
      saturation: Math.round(saturation * 100),
      lightness: Math.round(lightness * 100),
    };
  }

  /**
   * Convert HSLColor to CSS HSL string
   */
  static hslToString(hsl: HSLColor): string {
    return `${hsl.hue} ${hsl.saturation}% ${hsl.lightness}%`;
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
   * Adjust HSL values for creating color variations
   */
  static adjustHsl(hsl: HSLColor, adjustments: ColorAdjustments): HSLColor {
    return {
      hue: adjustments.hue ?? hsl.hue,
      saturation: adjustments.saturation ?? hsl.saturation,
      lightness: adjustments.lightness ?? hsl.lightness,
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
    if (uiOptions.color) {
      this.applyPrimaryColors(uiOptions.color);
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
  private applyPrimaryColors(primary: string): void {
    if (!primary) return;

    try {
      const primaryHsl = ColorUtils.hexToHsl(primary);
      const primaryHslString = ColorUtils.hslToString(primaryHsl);
      
      this.setCustomProperty('--primary', primaryHslString);

      // Set primary foreground based on contrast
      const primaryForeground = ColorUtils.getContrastColor(primary);
      const primaryForegroundHsl = ColorUtils.hexToHsl(primaryForeground);
      this.setCustomProperty('--primary-foreground', ColorUtils.hslToString(primaryForegroundHsl));

      // Generate accent colors based on primary color
      this.generateAccentColors(primaryHsl);
    } catch (error) {
      // Error applying primary colors - continue with defaults
    }
  }

  /**
   * Generate accent colors based on primary color
   */
  private generateAccentColors(primaryHsl: HSLColor): void {
    // Light accent
    const accentHsl = ColorUtils.adjustHsl(primaryHsl, { lightness: 95 });
    this.setCustomProperty('--accent', ColorUtils.hslToString(accentHsl));

    // Dark accent foreground
    const accentForegroundHsl = ColorUtils.adjustHsl(primaryHsl, { lightness: 10 });
    this.setCustomProperty('--accent-foreground', ColorUtils.hslToString(accentForegroundHsl));
  }

  /**
   * Set common color variables that are frequently used
   */
  private setCommonColorVariables(uiOptions: IWidgetUiOptions): void {
    // Set muted colors based on primary or use defaults
    if (uiOptions.color) {
      try {
        const primaryHsl = ColorUtils.hexToHsl(uiOptions.color);
        
        // Generate muted colors from primary
        const mutedHsl = ColorUtils.adjustHsl(primaryHsl, { lightness: 96, saturation: 5 });
        this.setCustomProperty('--muted', ColorUtils.hslToString(mutedHsl));
        
        const mutedForegroundHsl = ColorUtils.adjustHsl(primaryHsl, { lightness: 45, saturation: 5 });
        this.setCustomProperty('--muted-foreground', ColorUtils.hslToString(mutedForegroundHsl));
        
        // Set foreground based on primary or use default
        const foregroundHsl = ColorUtils.adjustHsl(primaryHsl, { lightness: 10 });
        this.setCustomProperty('--foreground', ColorUtils.hslToString(foregroundHsl));
        
        // Set input background - very light version of primary
        const inputHsl = ColorUtils.adjustHsl(primaryHsl, { lightness: 98, saturation: 2 });
        this.setCustomProperty('--input', ColorUtils.hslToString(inputHsl));
        
        // Set border color - light version of primary
        const borderHsl = ColorUtils.adjustHsl(primaryHsl, { lightness: 90, saturation: 10 });
        this.setCustomProperty('--border', ColorUtils.hslToString(borderHsl));
        
        // Set ring color - same as primary
        this.setCustomProperty('--ring', ColorUtils.hslToString(primaryHsl));
        
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

    if (uiOptions.color) {
      classes.primary = `bg-[${uiOptions.color}]`;
    }

    if (uiOptions.textColor) {
      classes['primary-foreground'] = `text-[${uiOptions.textColor}]`;
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
