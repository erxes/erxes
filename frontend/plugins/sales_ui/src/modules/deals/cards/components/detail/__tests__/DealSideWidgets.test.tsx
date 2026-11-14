import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DealSideWidgets } from '@/deals/cards/components/detail/DealSideWidgets';

type TModule = {
  name: string;
  pluginName: string;
  label: string;
  contentTypes?: string[];
};

type TTabsArgs = {
  contentType: string;
  contentId: string;
  customerId?: string;
  companyId?: string;
};

let mockModules: TModule[] = [];
const mockTabsArgs = jest.fn();

jest.mock('ui-modules', () => ({
  useRelationWidget: ({ contentType }: { contentType: string }) => ({
    relationWidgetsModules: mockModules.filter(
      (module) =>
        !module.contentTypes || module.contentTypes.includes(contentType),
    ),
  }),
  useRelationWidgetTabs: (args: TTabsArgs) => {
    mockTabsArgs(args);
    return mockModules
      .filter(
        (module) =>
          !module.contentTypes ||
          module.contentTypes.includes(args.contentType),
      )
      .map((module) => ({
        value: `${module.pluginName}.${module.name}`,
        pluginName: module.pluginName,
        label: module.label,
        icon: () => null,
        content: (
          <p>
            {module.label} of {args.contentId}
          </p>
        ),
      }));
  },
  RelationWidgetSideTabs: ({
    customerId,
    companyId,
    extraTabs = [],
  }: {
    customerId?: string | null;
    companyId?: string | null;
    extraTabs?: { value: string; label: string; content: ReactNode }[];
  }) => (
    <aside>
      {customerId && <span>customer {customerId}</span>}
      {companyId && <span>company {companyId}</span>}
      {extraTabs.map((tab) => (
        <section key={tab.value} aria-label={tab.label}>
          {tab.content}
        </section>
      ))}
    </aside>
  ),
}));

const ENABLED_PLUGIN_WIDGETS: TModule[] = [
  {
    name: 'transactions',
    pluginName: 'accounting',
    label: 'Transactions',
    contentTypes: ['sales:deal'],
  },
  {
    name: 'ebarimt',
    pluginName: 'mongolian',
    label: 'eBarimt',
    contentTypes: ['sales:deal'],
  },
  { name: 'ticket', pluginName: 'frontline', label: 'Tickets' },
  { name: 'deals', pluginName: 'sales', label: 'Deals' },
  {
    name: 'customer',
    pluginName: 'core',
    label: 'Customers',
    contentTypes: ['core:customer', 'core:company'],
  },
];

describe('DealSideWidgets', () => {
  afterEach(() => {
    mockTabsArgs.mockReset();
  });

  it("shows the deal's own transactions and eBarimt beside its contacts", () => {
    mockModules = ENABLED_PLUGIN_WIDGETS;

    render(
      <DealSideWidgets
        dealId="deal-ub-42"
        customerId="customer-bat"
        companyId="company-nomin"
      />,
    );

    expect(screen.getByText('customer customer-bat')).toBeTruthy();
    expect(screen.getByText('company company-nomin')).toBeTruthy();
    expect(screen.getByLabelText('Transactions').textContent).toBe(
      'Transactions of deal-ub-42',
    );
    expect(screen.getByLabelText('eBarimt').textContent).toBe(
      'eBarimt of deal-ub-42',
    );
    expect(mockTabsArgs).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: 'sales:deal',
        contentId: 'deal-ub-42',
      }),
    );
  });

  it("keeps the contacts' tickets and deals out of the deal rail", () => {
    mockModules = ENABLED_PLUGIN_WIDGETS;

    render(<DealSideWidgets dealId="deal-ub-42" customerId="customer-bat" />);

    expect(screen.queryByLabelText('Tickets')).toBeNull();
    expect(screen.queryByLabelText('Deals')).toBeNull();
    expect(screen.queryByLabelText('Customers')).toBeNull();
  });

  it('shows only the contacts when accounting and mongolian are disabled', () => {
    mockModules = ENABLED_PLUGIN_WIDGETS.filter(
      (module) => !['accounting', 'mongolian'].includes(module.pluginName),
    );

    render(
      <DealSideWidgets
        dealId="deal-ub-42"
        customerId={null}
        companyId={null}
      />,
    );

    expect(screen.queryAllByRole('region')).toHaveLength(0);
    expect(screen.queryByText(/customer/)).toBeNull();
    expect(mockTabsArgs).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: undefined, companyId: undefined }),
    );
  });
});
