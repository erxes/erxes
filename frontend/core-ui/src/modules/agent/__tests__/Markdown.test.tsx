/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import { Markdown } from '../components/Markdown';

// react-markdown + remark-gfm are ESM-only and jest runs CJS without a
// transform for node_modules — shim them. The link shim only handles the
// `[text](href)` syntax under test and renders through the component map,
// so the real `a` renderer (http→anchor, everything else→span) is what's
// exercised, not a copy of it.
jest.mock('remark-gfm', () => () => null);

jest.mock('react-markdown', () => {
  const React = jest.requireActual('react');
  const parseLinks = (text: string, components: any) => {
    const out: unknown[] = [];
    const re = /\[([^\]]+)\]\(([^)]+)\)/g;
    let last = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = re.exec(text))) {
      if (match.index > last) {
        out.push(text.slice(last, match.index));
      }
      const A =
        components?.a ??
        (({ href, children }: any) =>
          React.createElement('a', { href }, children));
      out.push(
        React.createElement(A, { key: `l${key++}`, href: match[2] }, match[1]),
      );
      last = match.index + match[0].length;
    }
    if (last < text.length) {
      out.push(text.slice(last));
    }
    return out;
  };

  return {
    __esModule: true,
    default: ({ children, components }: any) => {
      const P = components?.p ?? 'p';
      return React.createElement(
        P,
        null,
        parseLinks(String(children), components),
      );
    },
  };
});

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/contacts/customers', search: '' }),
}));

jest.mock('ui-modules', () => {
  const { atom } = jest.requireActual<{ atom: (v: unknown) => unknown }>(
    'jotai',
  );
  return {
    pluginsConfigState: atom(null),
    usePermissionCheck: jest.fn(() => ({
      isLoaded: true,
      hasActionPermission: () => false,
      hasModulePermission: () => true,
      isOwner: false,
      isWildcard: false,
      permissions: [],
      hasPluginPermission: () => false,
      getModuleActions: () => [],
    })),
    useQueryState: () => [null, jest.fn()],
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) =>
      fallback ?? key.split('.').pop() ?? key,
  }),
}));

jest.mock('erxes-ui', () => {
  const Passthrough = ({ children }: PropsWithChildren) => <>{children}</>;
  return {
    Tooltip: Object.assign(Passthrough, {
      Provider: Passthrough,
      Trigger: Passthrough,
      Content: Passthrough,
    }),
    cn: (...classes: (string | false | undefined)[]) =>
      classes.filter(Boolean).join(' '),
  };
});

describe('Markdown link rendering', () => {
  it('renders an external https link as a new-tab anchor', () => {
    render(<Markdown content="See [Docs](https://example.com/help) here." />);

    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.getAttribute('href')).toBe('https://example.com/help');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.getAttribute('rel')).toContain('noreferrer');
  });

  it('renders a mailto link as an anchor', () => {
    render(<Markdown content="Mail [us](mailto:a@b.co) today." />);

    expect(
      screen.getByRole('link', { name: 'us' }).getAttribute('href'),
    ).toBe('mailto:a@b.co');
  });

  it('renders a relative workspace path as plain text, not a link', () => {
    render(<Markdown content="Open [Deal](/deal/board?id=1) now." />);

    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Deal')).toBeTruthy();
  });

  it('renders a non-http scheme as plain text', () => {
    render(<Markdown content="Run [x](javascript:alert(1)) now." />);

    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('x')).toBeTruthy();
  });

  it('renders a hash-only href as plain text', () => {
    render(<Markdown content="Jump [down](#section) please." />);

    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('down')).toBeTruthy();
  });

  it('still resolves a reference token to a chip in normal prose', () => {
    render(
      <Markdown
        references
        content="Found [[customer:osN4lX7r8aKzoWtbkS3VC:Eval Bolormaa Ganbat]] yesterday."
      />,
    );

    expect(screen.getByText('Eval Bolormaa Ganbat')).toBeTruthy();
    // Chip renders as a button, not a link.
    expect(
      screen.getByRole('button', { name: /Eval Bolormaa Ganbat/ }),
    ).toBeTruthy();
  });
});
