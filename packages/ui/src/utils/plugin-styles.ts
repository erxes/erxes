/*
 * A plugin UI's own Tailwind utilities, added to web's page. web's stylesheet already holds
 * every class web and erxes-ui use, in Tailwind's order. A second copy of one of those later in
 * the page would win over the classes Tailwind sorts after it: a plugin's `hidden` would hide
 * web's `hidden md:flex` header at every width. So only the classes the page lacks go in, and
 * only from the utilities layer: web owns the theme, the page defaults and the preflight.
 */

const sheets = new Map<string, CSSStyleSheet>();

/** The class a rule is for: `md\:flex` in `.md\:flex`, `space-y-2` in `:where(.space-y-2 > …)`. */
const CLASS = /\.((?:\\[\da-f]{1,6} ?|\\.|[\w-])+)/i;

const classOf = (rule: CSSRule) =>
  rule instanceof CSSStyleRule ? CLASS.exec(rule.selectorText)?.[1] : undefined;

const collectClasses = (rules: CSSRuleList, into: Set<string>) => {
  for (const rule of rules) {
    const name = classOf(rule);

    if (name) into.add(name);
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

/** Deletes the rules for classes the page has, and the groups that leave empty. */
const dropKnown = (group: CSSStyleSheet | CSSGroupingRule, known: Set<string>) => {
  for (let index = group.cssRules.length - 1; index >= 0; index--) {
    const rule = group.cssRules[index];
    const name = rule && classOf(rule);

    if (name !== undefined && known.has(name)) group.deleteRule(index);
    else if (rule instanceof CSSGroupingRule && !(rule instanceof CSSStyleRule)) {
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
 * Adds `css`, the plugin's compiled Tailwind (`import css from './styles.css?inline'`), to the
 * page: its utilities layer without the classes the page already has, and its `@property` and
 * `@keyframes` rules. Calling it again for the same plugin replaces its sheet.
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
