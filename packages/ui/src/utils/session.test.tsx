// @vitest-environment happy-dom
import { describe, expect, it } from 'vite-plus/test';
import { setupDomRender } from '../lib/render-in-dom';
import { Can, type HostSession, HostSessionProvider, useHostSession } from './session';

const render = setupDomRender();

const SESSION: HostSession = {
  user: { id: 'u1', email: 'bold@x.mn', fullName: 'Bold', username: null, avatarUrl: null },
  organization: {
    id: 'o1',
    name: 'Erxes LLC',
    country: 'MN',
    currency: 'MNT',
    currencies: ['USD'],
    timezone: 'Asia/Ulaanbaatar',
  },
  permissions: ['accounting.account.read', 'accounting.account.import'],
};

const OrgName = () => <span>{useHostSession()?.organization.name ?? 'outside'}</span>;

const Gates = () => (
  <>
    <Can action="accounting.account.import">import </Can>
    <Can action="accounting.account.remove" fallback="no-remove ">
      remove{' '}
    </Can>
    <Can actions={['accounting.config.manage', 'accounting.account.read']}>any </Can>
    <OrgName />
  </>
);

describe('Can and useHostSession', () => {
  it('show what the signed-in member may do, and their organisation', () => {
    const page = render(
      <HostSessionProvider session={SESSION}>
        <Gates />
      </HostSessionProvider>,
    );

    expect(page.textContent).toBe('import no-remove any Erxes LLC');
  });

  it('allow nothing outside erxes', () => {
    expect(render(<Gates />).textContent).toBe('no-remove outside');
  });
});
