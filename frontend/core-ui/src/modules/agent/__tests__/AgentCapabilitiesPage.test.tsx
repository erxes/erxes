/** @jest-environment jsdom */
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  PropsWithChildren,
  ReactElement,
} from 'react';
import { AgentCapabilitiesPage } from '../../../pages/agent/AgentCapabilitiesPage';
import { AGENTS_TOOLS, type IAgentsTool } from '../graphql/tools';

jest.mock('react-router-dom', () => ({
  Link: ({
    to,
    ...props
  }: HTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props} />
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (
      key: string,
      fallback?: string,
      values?: Record<string, string | number>,
    ) =>
      (fallback ?? key).replace(/\{\{(\w+)\}\}/g, (_match, name: string) =>
        String(values?.[name] ?? ''),
      ),
  }),
}));

jest.mock('ui-modules', () => {
  const Wrapper = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    PageHeader: Object.assign(Wrapper, { Start: Wrapper, End: Wrapper }),
  };
});

jest.mock('erxes-ui', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const Wrapper = ({ children }: PropsWithChildren) => <div>{children}</div>;
  const CollapsibleContext = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }>({
    open: false,
    onOpenChange: () => undefined,
  });
  const ToggleContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
  }>({
    value: '',
    onValueChange: () => undefined,
  });

  return {
    Badge: Wrapper,
    Breadcrumb: Object.assign(Wrapper, {
      List: Wrapper,
      Item: Wrapper,
      Separator: Wrapper,
      Page: Wrapper,
    }),
    Button: ({
      variant,
      size,
      asChild,
      children,
      ...props
    }: ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: string;
      size?: string;
      asChild?: boolean;
    }) => {
      void variant;
      void size;
      return asChild ? children : <button {...props}>{children}</button>;
    },
    Collapsible: Object.assign(
      ({
        children,
        open,
        onOpenChange,
      }: PropsWithChildren<{
        open: boolean;
        onOpenChange: (open: boolean) => void;
      }>) => (
        <CollapsibleContext.Provider value={{ open, onOpenChange }}>
          {children}
        </CollapsibleContext.Provider>
      ),
      {
        Trigger: ({ children }: { children: ReactElement }) => {
          const { open, onOpenChange } = React.useContext(CollapsibleContext);
          return React.cloneElement(children, {
            'aria-expanded': open,
            onClick: () => onOpenChange(!open),
          });
        },
        Content: ({ children }: PropsWithChildren) =>
          React.useContext(CollapsibleContext).open ? children : null,
      },
    ),
    Input: (props: InputHTMLAttributes<HTMLInputElement>) => (
      <input {...props} />
    ),
    Skeleton: Wrapper,
    ToggleGroup: Object.assign(
      ({
        children,
        value,
        onValueChange,
      }: PropsWithChildren<{
        value: string;
        onValueChange: (value: string) => void;
      }>) => (
        <ToggleContext.Provider value={{ value, onValueChange }}>
          {children}
        </ToggleContext.Provider>
      ),
      {
        Item: ({ children, value }: PropsWithChildren<{ value: string }>) => {
          const context = React.useContext(ToggleContext);
          return (
            <button
              aria-pressed={value === context.value}
              onClick={() => context.onValueChange(value)}
            >
              {children}
            </button>
          );
        },
      },
    ),
    cn: (...classes: (string | false | undefined)[]) =>
      classes.filter(Boolean).join(' '),
  };
});

const coreTools: IAgentsTool[] = Array.from({ length: 23 }, (_, index) => ({
  id: `core-${index + 1}`,
  plugin: 'core',
  module: 'graphql',
  path: `coreTool${String(index + 1).padStart(2, '0')}`,
  method: index === 2 ? 'mutation' : 'query',
  description: `Core operation ${index + 1}`,
  requiresApproval: index === 2,
  inputFields: [],
}));

const tools: IAgentsTool[] = [
  ...coreTools,
  {
    id: 'sales-list',
    plugin: 'sales',
    module: 'graphql',
    path: 'salesDeals',
    method: 'query',
    description: 'Browse available deals',
    requiresApproval: false,
    inputFields: [],
  },
  {
    id: 'sales-create',
    plugin: 'sales',
    module: 'graphql',
    path: 'salesDealCreate',
    method: 'mutation',
    description: 'Create a deal',
    requiresApproval: true,
    inputFields: [{ name: 'name', type: 'String!', required: true }],
  },
  {
    id: 'frontline-channels',
    plugin: 'frontline',
    module: 'graphql',
    path: 'getChannels',
    method: 'query',
    description: 'Find support channels',
    requiresApproval: false,
    inputFields: [],
  },
];

const renderCapabilities = () =>
  render(
    <MockedProvider
      mocks={[
        {
          request: { query: AGENTS_TOOLS },
          result: { data: { agentsTools: { tools, unavailablePlugins: [] } } },
        },
      ]}
      addTypename={false}
    >
      <AgentCapabilitiesPage />
    </MockedProvider>,
  );

it('starts with plugin summaries and counts while keeping operation rows hidden', async () => {
  renderCapabilities();

  const core = await screen.findByRole('button', { name: /^Core / });
  expect(within(core).getByText('23')).not.toBeNull();
  expect(
    within(screen.getByRole('button', { name: /^Sales / })).getByText('2'),
  ).not.toBeNull();
  expect(
    within(screen.getByRole('button', { name: /^Frontline / })).getByText('1'),
  ).not.toBeNull();
  expect(screen.getByText('26')).not.toBeNull();
  expect(screen.queryByRole('button', { name: /Core tool01/i })).toBeNull();
  expect(screen.queryByText('Core operation 1')).toBeNull();
});

it('browses tools twenty at a time and opens details for an operation with no inputs', async () => {
  renderCapabilities();
  fireEvent.click(await screen.findByRole('button', { name: /^Core / }));

  expect(
    screen.getAllByRole('button', { name: /^Core tool\d+/i }),
  ).toHaveLength(20);
  expect(screen.getByText('Page 1 of 2')).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /Core tool01/i }));
  expect(screen.getByText('No inputs required.')).not.toBeNull();
  expect(screen.getByText('API operation')).not.toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByText('Page 2 of 2')).not.toBeNull();
  expect(
    screen.getAllByRole('button', { name: /^Core tool\d+/i }),
  ).toHaveLength(3);
  expect(screen.queryByRole('button', { name: /Core tool01/i })).toBeNull();
  expect(
    screen.getByRole('button', { name: 'Next' }).hasAttribute('disabled'),
  ).toBe(true);

  fireEvent.click(screen.getByRole('button', { name: 'All plugins' }));
  expect(screen.getByRole('button', { name: /^Sales / })).not.toBeNull();
  expect(screen.queryByRole('button', { name: /Core tool23/i })).toBeNull();
});

it('searches plugin names and tool text, combines filters, and clears empty results', async () => {
  renderCapabilities();
  await screen.findByRole('button', { name: /^Core / });
  const search = screen.getByRole('textbox', { name: 'Search capabilities' });

  fireEvent.change(search, { target: { value: 'sales' } });
  expect(screen.queryByRole('button', { name: /^Core / })).toBeNull();
  expect(screen.queryByRole('button', { name: /^Frontline / })).toBeNull();
  const sales = screen.getByRole('button', { name: /^Sales / });
  expect(within(sales).getByText('2')).not.toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Asks first' }));
  expect(within(sales).getByText(/^1 matching tool/)).not.toBeNull();
  fireEvent.click(sales);
  expect(
    screen.getByRole('button', { name: /Sales deal create/i }),
  ).not.toBeNull();
  expect(
    screen.queryByRole('button', { name: /Sales deals read/i }),
  ).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Read' }));
  expect(
    screen.getByRole('button', { name: /Sales deals read/i }),
  ).not.toBeNull();
  expect(
    screen.queryByRole('button', { name: /Sales deal create/i }),
  ).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Write' }));
  expect(
    screen.getByRole('button', { name: /Sales deal create/i }),
  ).not.toBeNull();
  expect(screen.queryByRole('button', { name: /Sales deals read/i })).toBeNull();

  fireEvent.change(search, { target: { value: 'missing capability' } });
  expect(screen.getByText('No capabilities match this filter.')).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(
    screen.getByRole('button', { name: /Sales deals read/i }),
  ).not.toBeNull();
  expect(
    screen.getByRole('button', { name: /Sales deal create/i }),
  ).not.toBeNull();

  fireEvent.change(search, { target: { value: 'Create a deal' } });
  expect(
    screen.getByRole('button', { name: /Sales deal create/i }),
  ).not.toBeNull();
  expect(
    screen.queryByRole('button', { name: /Sales deals read/i }),
  ).toBeNull();
});
