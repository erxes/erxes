import type { PortalTheme as Theme } from '@/modules/knowledge-base/utils/normalize';

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
