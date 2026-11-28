// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { setupDomRender } from '../../lib/render-in-dom';
import { Export, Import, setTransferButtons } from './transfer';

const render = setupDomRender();

afterEach(() => setTransferButtons(null));

describe('Import and Export', () => {
  it('render nothing outside erxes, and the host’s buttons once it registers them', () => {
    const page = render(
      <>
        <Import recordType="accounting:account" title="Import accounts">
          A guide
        </Import>
        <Export recordType="accounting:transaction" ids={['t1']} />
      </>,
    );

    expect(page.textContent).toBe('');

    act(() =>
      setTransferButtons({
        Import: ({ recordType, title, children }) => (
          <span>
            {`import ${recordType} ${title ?? ''} `}
            {children}
          </span>
        ),
        Export: ({ recordType, ids }) => <span>{` export ${recordType} ${ids?.join()}`}</span>,
      }),
    );

    expect(page.textContent).toBe(
      'import accounting:account Import accounts A guide export accounting:transaction t1',
    );
  });
});
