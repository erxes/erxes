import { atom, useAtom } from 'jotai';
import {
  createContext,
  useContext,
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type PropsWithChildren,
} from 'react';
import { Controller, FormProvider } from 'react-hook-form';
import { act } from '@testing-library/react';

/** Renders mock UI containers without changing their children. */
export const Wrap = ({ children }: PropsWithChildren) => <div>{children}</div>;

/** Preserves native submit, click and disabled behavior in provider tests. */
const Button = ({
  children,
  onClick,
  disabled,
  type,
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type={type} onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

/** Exposes controlled brand selection through a labeled input. */
export const BrandInput = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => (
  <input
    aria-label="brandId"
    value={value ?? ''}
    onChange={(event) => onValueChange(event.target.value)}
  />
);

/** Shares the form controls used by the real provider forms in regression tests. */
export const createProviderUi = () => ({
  Button,
  Input: forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    (props, ref) => (
      <input
        {...props}
        value={props.value ?? ''}
        ref={ref}
        aria-label={props.name}
      />
    ),
  ),
  Form: Object.assign(FormProvider, {
    Field: Controller,
    Item: Wrap,
    Label: Wrap,
    Control: Wrap,
    Description: Wrap,
    Message: () => null,
  }),
  Select: Object.assign(Wrap, {
    Trigger: Wrap,
    Value: () => null,
    Content: Wrap,
    Item: Wrap,
  }),
  Sheet: Object.assign(Wrap, {
    Trigger: Wrap,
    View: Wrap,
    Header: Wrap,
    Title: Wrap,
    Close: Wrap,
    Content: Wrap,
    Footer: Wrap,
  }),
  Collapsible: Object.assign(Wrap, {
    Trigger: Wrap,
    TriggerIcon: () => null,
    Content: Wrap,
  }),
  Spinner: () => <span>Loading</span>,
  isDeeplyEqual: (left: unknown, right: unknown) =>
    JSON.stringify(left) === JSON.stringify(right),
  toast: jest.fn(),
  useConfirm: () => ({ confirm: () => Promise.resolve() }),
  REACT_APP_API_URL: 'https://api.example.com',
});

/** Flushes asynchronous form work after synchronous events or deferred network completion. */
export const flushProviderUpdates = async (
  action: () => void,
): Promise<void> => {
  await act(async () => {
    action();
    await Promise.resolve();
  });
};

const panelRecord = atom<{ contentId: string } | null>(null);

/** Supplies the public side panel contract to Telegram setup and disconnect tests. */
export const createTelegramSidePanel = () => ({
  PanelFormRow: Wrap,
  useSidePanel: () => {
    const [record, setRecord] = useAtom(panelRecord);
    return {
      record,
      close: () => setRecord(null),
      openRecord: ({ contentId }: { contentId: string }) =>
        setRecord({ contentId }),
      openNewRecord: () => setRecord({ contentId: 'new' }),
    };
  },
});

/** Keeps Select option handlers usable in provider wizard regression tests. */
export const createSelectableUi = () => {
  const SelectContext = createContext<(value: string) => void>(() => undefined);
  const SelectRoot = ({
    children,
    onValueChange,
  }: PropsWithChildren<{ onValueChange: (value: string) => void }>) => (
    <SelectContext.Provider value={onValueChange}>
      {children}
    </SelectContext.Provider>
  );
  const SelectItem = ({
    children,
    value,
  }: PropsWithChildren<{ value: string }>) => {
    const select = useContext(SelectContext);
    return (
      <button type="button" onClick={() => select(value)}>
        {children}
      </button>
    );
  };
  return Object.assign(SelectRoot, {
    Trigger: Wrap,
    Value: () => null,
    Content: Wrap,
    Item: SelectItem,
  });
};
