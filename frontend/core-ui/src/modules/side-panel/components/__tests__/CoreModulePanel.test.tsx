/** @jest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'jotai';
import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CoreModulePanel } from '../CoreModulePanel';
import { CoreModulePanelSlot } from '../CoreModulePanelSlot';
import { useSidePanel } from 'ui-modules';
import { SidePanelRecordStack } from '../SidePanelRecordStack';
import type { IRecordViewProps } from 'ui-modules';

jest.mock('react-router-dom', () => {
  const { TextEncoder } = jest.requireActual<typeof import('util')>('util');
  Object.defineProperty(globalThis, 'TextEncoder', { value: TextEncoder });
  return jest.requireActual('react-router-dom');
});
jest.mock('ui-modules', () => ({
  ...jest.requireActual(
    '../../../../../../libs/ui-modules/src/modules/widget/record-side-panel/useSidePanel',
  ),
  usePermissionCheck: () => ({ hasActionPermission: () => true }),
  RecordSidePanel: { Header: () => null },
}));
jest.mock('erxes-ui', () => {
  const { Dialog } = jest.requireActual<typeof import('radix-ui')>('radix-ui');
  const pass = ({ children }: React.PropsWithChildren) => <>{children}</>;
  const sheet = Object.assign(Dialog.Root, {
    ...Dialog,
    Header: pass,
    Content: pass,
    Footer: pass,
    View: pass,
  });
  return {
    ...jest.requireActual(
      '../../../../../../libs/erxes-ui/src/hooks/use-query-state',
    ),
    Sheet: sheet,
    FocusSheet: sheet,
    Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
      <button {...props}>{children}</button>
    ),
    Empty: Object.assign(pass, {
      Header: pass,
      Title: pass,
      Description: pass,
    }),
    cn: (...items: string[]) => items.filter(Boolean).join(' '),
  };
});
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

const Host = () => {
  const { path, close } = useSidePanel();
  return (
    <>
      <output aria-label="Panel path">{path || 'closed'}</output>
      {path && <CoreModulePanelSlot path={path} onClose={close} />}
    </>
  );
};
const Editor = ({ controlled }: { controlled: boolean }) => {
  const [open, setOpen] = useState(true);
  return (
    <CoreModulePanel
      name="test-editor"
      {...(controlled
        ? { open, onOpenChange: setOpen }
        : { defaultOpen: true })}
    >
      <CoreModulePanel.View>
        <input aria-label="Editor name" defaultValue="Keep" />
        <CoreModulePanel.Close>Close editor</CoreModulePanel.Close>
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
it.each([false, true])(
  'keeps a closed module closed (controlled: %s)',
  async (controlled) => {
    window.history.replaceState(null, '', '/');
    render(
      <Provider>
        <BrowserRouter>
          <Editor controlled={controlled} />
          <Host />
        </BrowserRouter>
      </Provider>,
    );
    await screen.findByRole('textbox', { name: 'Editor name' });
    fireEvent.click(screen.getByRole('button', { name: 'Close editor' }));
    await waitFor(() =>
      expect(screen.getByLabelText('Panel path').textContent).toBe('closed'),
    );
    expect(screen.queryByRole('textbox', { name: 'Editor name' })).toBeNull();
  },
);

const StatefulRecord = ({ record, onBack }: IRecordViewProps) => {
  const { openRecord } = useSidePanel();
  return record.contentType === 'core:user' ? (
    <button onClick={onBack}>Return to draft</button>
  ) : (
    <>
      <input aria-label="Draft name" defaultValue="" />
      <button
        onClick={() =>
          openRecord(
            { contentType: 'core:user', contentId: 'member-a' },
            { stack: true },
          )
        }
      >
        Open member
      </button>
    </>
  );
};
const StackHost = () => {
  const panel = useSidePanel();
  return (
    <SidePanelRecordStack
      path={panel.path || ''}
      history={panel.history}
      View={StatefulRecord}
      onBack={panel.back}
      onClose={panel.close}
    />
  );
};
it('retains the exact draft input while visiting a member and going back', async () => {
  window.history.replaceState(null, '', '/?panel=/detail/customer/new/draft-a');
  render(
    <Provider>
      <BrowserRouter>
        <StackHost />
      </BrowserRouter>
    </Provider>,
  );
  const draft = screen.getByRole<HTMLInputElement>('textbox', {
    name: 'Draft name',
  });
  fireEvent.change(draft, { target: { value: 'Not saved yet' } });
  fireEvent.click(screen.getByRole('button', { name: 'Open member' }));
  fireEvent.click(
    await screen.findByRole('button', { name: 'Return to draft' }),
  );
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: 'Draft name' })).toBe(draft),
  );
  expect(draft.value).toBe('Not saved yet');
});
