import type { PortalTheme as Theme } from '@/modules/knowledge-base/utils/normalize';

/*
 * A stored font is a full CSS stack chosen in the help center's appearance tab.
 * It is written into a custom property rather than a `font-family` rule so it
 * overrides the bundled Open Sans through the same token the theme uses, and
 * the bundled face stays as the fallback when nothing was picked.
 */
const declarations = (theme: Theme): string => {
  const lines = Object.entries(theme.colors).map(
    ([token, value]) => `${token}: ${value};`,
  );

  if (theme.baseFont) {
    lines.push(`--font-sans: ${theme.baseFont};`);
  }

  if (theme.headingFont) {
    lines.push(`--font-heading: ${theme.headingFont};`);
  }

  return lines.join('');
};

/**
 * Applies the help center's appearance to the whole document. Renders nothing
 * when the topic set no appearance at all, leaving the portal's own palette.
 */
export const PortalTheme = ({ theme }: { theme: Theme | null }) => {
  if (!theme) {
    return null;
  }

  const body = declarations(theme);

  if (!body) {
    return null;
  }

  return <style>{`:root{${body}}`}</style>;
};
