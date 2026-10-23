/** Generated HTML owns layout; the host owns the preview's readable palette. */
export const HTML_THEME_DEFAULTS = {
  background: '#ffffff',
  foreground: '#242424',
  muted: '#f4f4f5',
  'muted-foreground': '#71717a',
  border: '#e4e4e7',
  primary: '#635bdf',
} as const;

const protectedTokens = new Set(
  Object.keys(HTML_THEME_DEFAULTS).map((name) => `--${name}`),
);
const textColor = (value: string) =>
  [
    'var(--foreground)',
    'var(--muted-foreground)',
    'var(--primary)',
    'inherit',
    'currentcolor',
  ].includes(value.trim().toLowerCase())
    ? value
    : 'var(--foreground)';
const surfaceColor = (value: string) =>
  ['transparent', 'none', 'initial', 'unset', 'inherit'].includes(
    value.trim().toLowerCase(),
  )
    ? 'transparent'
    : value.trim() === 'var(--background)'
    ? 'var(--background)'
    : 'var(--muted)';

const normalizeStyle = (style: CSSStyleDeclaration) => {
  // Use the browser's CSS parser, including shorthands and nested rules.
  const properties = Array.from(style);
  for (const property of properties) {
    const value = style.getPropertyValue(property);
    const priority = style.getPropertyPriority(property);
    if (
      protectedTokens.has(property) ||
      [
        'color-scheme',
        'opacity',
        'filter',
        'backdrop-filter',
        'mix-blend-mode',
        'text-shadow',
        'box-shadow',
        'background-blend-mode',
        'background-clip',
        '-webkit-background-clip',
      ].includes(property)
    ) {
      style.removeProperty(property);
    } else if (property === 'color') {
      style.setProperty(property, textColor(value), priority);
    } else if (property === '-webkit-text-fill-color') {
      style.setProperty(property, 'currentColor', priority);
    } else if (property === 'background' || property === 'background-color') {
      const color = surfaceColor(value);
      style.removeProperty(property);
      style.setProperty('background-color', color, priority);
    } else if (property === 'background-image') {
      style.setProperty(property, 'none', priority);
    } else if (
      /^(border(?:-(?:top|right|bottom|left|block|inline)(?:-start|-end)?)?|outline|column-rule)$/.test(
        property,
      )
    ) {
      // Retain the shorthand's widths and styles; replace its paint only.
      style.setProperty(`${property}-color`, 'var(--border)', priority);
    } else if (/^(?:border.*|outline|column-rule)-color$/.test(property)) {
      style.setProperty(property, 'var(--border)', priority);
    } else if (property === 'text-decoration-color') {
      style.setProperty(property, 'currentColor', priority);
    }
  }
};

const normalizeRules = (rules: CSSRuleList) => {
  for (const rule of Array.from(rules)) {
    if ('style' in rule) normalizeStyle((rule as CSSStyleRule).style);
    if ('cssRules' in rule) normalizeRules((rule as CSSGroupingRule).cssRules);
  }
};

/** Run once per content update, before the browser paints the refreshed frame. */
export const applyHtmlThemePolicy = (document: Document) => {
  for (const sheet of Array.from(document.styleSheets)) {
    normalizeRules(sheet.cssRules);
  }
  for (const element of Array.from(
    document.querySelectorAll<HTMLElement | SVGElement>('[style]'),
  )) {
    normalizeStyle(element.style);
  }
  // Older HTML may use presentation attributes rather than CSS.
  for (const element of Array.from(
    document.querySelectorAll<HTMLElement>('[color], [bgcolor]'),
  )) {
    element.removeAttribute('color');
    if (element.hasAttribute('bgcolor')) {
      element.removeAttribute('bgcolor');
      element.style.setProperty(
        'background-color',
        'var(--muted)',
        'important',
      );
    }
  }
  // Chart series keep their SVG paints; chart labels always follow the theme.
  for (const label of Array.from(
    document.querySelectorAll<SVGElement>('svg text, svg tspan'),
  )) {
    label.style.setProperty('fill', 'var(--foreground)', 'important');
    label.style.setProperty('color', 'var(--foreground)', 'important');
    label.style.setProperty('stroke', 'none', 'important');
  }
  for (const element of [document.documentElement, document.body]) {
    element.style.setProperty('background', 'transparent', 'important');
    element.style.setProperty('color', 'var(--foreground)', 'important');
  }
};
