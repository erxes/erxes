/*
 * A plugin UI's own Tailwind utilities, added to web's page. web's stylesheet already holds
 * every class web and erxes-ui use, in Tailwind's order. A second copy of one of those later in
 * the page would win over the classes Tailwind sorts after it: a plugin's `hidden` would hide
 * web's `hidden md:flex` header at every width. So only the classes the page lacks go in, and
 * only from the utilities layer: web owns the theme, the page defaults and the preflight.
 */

const sheets = new Map<string, CSSStyleSheet>();

/** The class a selector is for: `md\:flex` in `.md\:flex`, `space-y-2` in `:where(.space-y-2 > …)`. */
const CLASS = /\.((?:\\[\da-f]{1,6} ?|\\.|[\w-])+)/i;

const classOf = (selector: string) => CLASS.exec(selector)?.[1];

/** The selectors of a list, split at the commas outside brackets: `:is(.a, .b)` stays one. */
const selectorList = (selectorText: string) => {
  const selectors: string[] = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < selectorText.length; index++) {
    const char = selectorText[index];

    if (char === '\\') index++;
    else if (char === '(' || char === '[') depth++;
    else if (char === ')' || char === ']') depth--;
    else if (char === ',' && depth === 0) {
      selectors.push(selectorText.slice(start, index).trim());
      start = index + 1;
    }
  }

  return [...selectors, selectorText.slice(start).trim()];
};

/**
 * The selectors of a list whose class the page lacks, and those with no class. Minified Tailwind
 * merges rules with the same body into one list (`.bg-info,.bg-info\/10{…}`), so each selector
 * is judged on its own.
 */
export const unknownSelectors = (selectorText: string, known: Set<string>) =>
  selectorList(selectorText).filter((selector) => {
    const name = classOf(selector);

    return name === undefined || !known.has(name);
  });

const collectClasses = (rules: CSSRuleList, into: Set<string>) => {
  for (const rule of rules) {
    const names =
      rule instanceof CSSStyleRule
        ? selectorList(rule.selectorText).flatMap((selector) => classOf(selector) ?? [])
        : [];

    if (names.length > 0) for (const name of names) into.add(name);
    else if (rule instanceof CSSGroupingRule) collectClasses(rule.cssRules, into);
  }
};

/** Another origin's sheet can't be read; web's own and inline ones can. */
const sameOrigin = (sheet: CSSStyleSheet) =>
  !sheet.href || new URL(sheet.href).origin === window.location.origin;

/** Every class the page's other style sheets style. */
const pageClasses = (except: CSSStyleSheet | undefined) => {
  const classes = new Set<string>();

  for (const sheet of [...document.styleSheets, ...document.adoptedStyleSheets]) {
    if (sheet !== except && sameOrigin(sheet)) collectClasses(sheet.cssRules, classes);
  }

  return classes;
};

/**
 * Deletes the selectors for classes the page has, the rules that leave with none, and the groups
 * that leave empty.
 */
const dropKnown = (group: CSSStyleSheet | CSSGroupingRule, known: Set<string>) => {
  for (let index = group.cssRules.length - 1; index >= 0; index--) {
    const rule = group.cssRules[index];

    if (rule instanceof CSSStyleRule) {
      const kept = unknownSelectors(rule.selectorText, known);

      if (kept.length === 0) group.deleteRule(index);
      else rule.selectorText = kept.join(', ');
    } else if (rule instanceof CSSGroupingRule) {
      dropKnown(rule, known);

      if (rule.cssRules.length === 0) group.deleteRule(index);
    }
  }
};

/** What a plugin sheet keeps besides its utilities: the custom properties and keyframes they use. */
const isSupport = (rule: CSSRule) =>
  rule instanceof CSSPropertyRule ||
  rule instanceof CSSKeyframesRule ||
  rule instanceof CSSLayerStatementRule ||
  (rule instanceof CSSLayerBlockRule && rule.name === 'properties');

/**
 * Adds a plugin UI's compiled Tailwind to the page, minus what web has.
 * Pass `css` from `import css from './styles.css?inline'`. It keeps the utilities layer without
 * the classes the page already has, and the `@property` and `@keyframes` rules. Calling it again
 * for the same plugin replaces its sheet.
 */
export const addPluginStyles = (plugin: string, css: string) => {
  const previous = sheets.get(plugin);
  const sheet = new CSSStyleSheet();

  sheet.replaceSync(css);

  for (let index = sheet.cssRules.length - 1; index >= 0; index--) {
    const rule = sheet.cssRules[index];
    const utilities = rule instanceof CSSLayerBlockRule && rule.name === 'utilities';

    if (rule && !utilities && !isSupport(rule)) sheet.deleteRule(index);
  }

  dropKnown(sheet, pageClasses(previous));
  sheets.set(plugin, sheet);
  document.adoptedStyleSheets = [
    ...document.adoptedStyleSheets.filter((adopted) => adopted !== previous),
    sheet,
  ];
};
