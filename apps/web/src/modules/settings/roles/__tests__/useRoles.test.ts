// @vitest-environment happy-dom
import type { Role } from '@erxes/core-contract';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { i18n, i18nReady } from '~/i18n';
import { useRoles } from '../useRoles';

const role = (key: string, name: string, description: string | null): Role => ({
  key,
  name,
  description,
  permissions: [],
  builtin: !key.startsWith('r_'),
  editable: key !== 'owner' && key !== 'admin',
  members: 1,
});

/** What core seeds (in English), Member renamed by the organisation, and one of its own roles. */
const ROLES: Role[] = [
  role('owner', 'Owner', "Everything, including plugins and the audit log's retention"),
  role('admin', 'Admin', 'Everything except owner-only actions'),
  role('member', 'Sales rep', 'Works with contacts and tags'),
  role('r_support', 'Support', null),
];

const answer = async (input: RequestInfo | URL) => {
  const { pathname } = new URL(input instanceof Request ? input.url : String(input));

  return pathname === '/core/v1/roles'
    ? Response.json({ data: ROLES })
    : Response.json({ code: 'NOT_FOUND', message: 'Not found' }, { status: 404 });
};

let root: Root | undefined;

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal('fetch', answer);
  await i18nReady;
  await i18n.changeLanguage('mn');
});

afterAll(() => i18n.changeLanguage('en'));

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

/** Each role as a list row shows it, then a team member's role. */
const Roles = () => {
  const { roles, roleName } = useRoles();

  return createElement(
    'ul',
    null,
    roles.map((item) =>
      createElement('li', { key: item.key }, `${item.name}: ${item.description}`),
    ),
    createElement('li', { key: 'member-of' }, roleName('admin')),
  );
};

describe('role names in Mongolian', () => {
  it('shows the built-in roles in the member’s language and the organisation’s own as written', async () => {
    const container = document.createElement('div');

    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root?.render(
        createElement(QueryClientProvider, { client: new QueryClient() }, createElement(Roles)),
      );
    });
    await vi.waitFor(() => expect(container.querySelectorAll('li')).toHaveLength(5));

    expect([...container.querySelectorAll('li')].map((item) => item.textContent)).toEqual([
      'Эзэмшигч: Плагин, аудитын бүртгэлийн хадгалалтын хугацаа зэрэг бүх зүйл',
      'Админ: Зөвхөн эзэмшигчийн үйлдлээс бусад бүх зүйл',
      'Sales rep: Харилцагч, шошготой ажиллана',
      'Support: null',
      'Админ',
    ]);
  });
});
