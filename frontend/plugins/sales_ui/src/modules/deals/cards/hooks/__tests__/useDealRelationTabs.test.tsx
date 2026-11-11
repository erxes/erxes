import { renderHook } from '@testing-library/react';
import { useDealRelationTabs } from '@/deals/cards/hooks/useDealRelationTabs';

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
        content: `${module.label} of ${args.contentId}`,
      }));
  },
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

const renderTabs = (props: {
  dealId: string;
  customerId?: string | null;
  companyId?: string | null;
}) => renderHook(() => useDealRelationTabs(props)).result.current;

const labels = (tabs: ReturnType<typeof useDealRelationTabs>) =>
  tabs.map((tab) => tab.label);

describe('useDealRelationTabs', () => {
  afterEach(() => {
    mockTabsArgs.mockReset();
  });

  it("lists the deal's own transactions and eBarimt, read by the deal", () => {
    mockModules = ENABLED_PLUGIN_WIDGETS;

    const tabs = renderTabs({
      dealId: 'deal-ub-42',
      customerId: 'customer-bat',
      companyId: 'company-nomin',
    });

    expect(labels(tabs)).toEqual(['Transactions', 'eBarimt']);
    expect(tabs.map((tab) => tab.content)).toEqual([
      'Transactions of deal-ub-42',
      'eBarimt of deal-ub-42',
    ]);
    expect(mockTabsArgs).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: 'sales:deal',
        contentId: 'deal-ub-42',
      }),
    );
  });

  it("keeps the contacts' tickets, deals and customers out", () => {
    mockModules = ENABLED_PLUGIN_WIDGETS;

    const tabs = renderTabs({
      dealId: 'deal-ub-42',
      customerId: 'customer-bat',
    });

    expect(labels(tabs)).not.toContain('Tickets');
    expect(labels(tabs)).not.toContain('Deals');
    expect(labels(tabs)).not.toContain('Customers');
  });

  it("lists the deal's payment invoices, which register no contentTypes", () => {
    mockModules = [
      ...ENABLED_PLUGIN_WIDGETS,
      { name: 'invoices', pluginName: 'payment', label: 'Invoices' },
    ];

    const tabs = renderTabs({
      dealId: 'deal-ub-42',
      customerId: 'customer-bat',
    });

    expect(labels(tabs)).toEqual(['Transactions', 'eBarimt', 'Invoices']);
    expect(tabs[2].content).toBe('Invoices of deal-ub-42');
  });

  it('matches invoices by their plugin, not by the widget name alone', () => {
    mockModules = [
      ...ENABLED_PLUGIN_WIDGETS,
      { name: 'invoices', pluginName: 'frontline', label: 'Ticket invoices' },
    ];

    const tabs = renderTabs({
      dealId: 'deal-ub-42',
      customerId: 'customer-bat',
    });

    expect(labels(tabs)).not.toContain('Ticket invoices');
  });

  it('lists nothing when accounting and mongolian are disabled', () => {
    mockModules = ENABLED_PLUGIN_WIDGETS.filter(
      (module) => !['accounting', 'mongolian'].includes(module.pluginName),
    );

    const tabs = renderTabs({
      dealId: 'deal-ub-42',
      customerId: null,
      companyId: null,
    });

    expect(tabs).toEqual([]);
    expect(mockTabsArgs).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: undefined, companyId: undefined }),
    );
  });
});
