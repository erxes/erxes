/** @jest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RecordSidePanel } from 'ui-modules/modules/widget/record-side-panel/RecordSidePanel';
import { ProductPanelNew } from '@/products/product-detail/components/panel/ProductPanelNew';

// What the Data Extension fields hold when `productsAdd` sends them.
const mockExtension: { value?: string } = {};
const mockProductsAdd = jest.fn();
let mockFieldGroups: { _id: string }[] = [];

jest.mock('erxes-ui', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const primitives = jest.requireActual<typeof import('radix-ui')>('radix-ui');
  return {
    cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
    Button: ReactModule.forwardRef<
      HTMLButtonElement,
      React.ComponentProps<'button'>
    >(({ children, ...props }, ref) => (
      <button ref={ref} {...props}>
        {children}
      </button>
    )),
    Tabs: Object.assign(primitives.Tabs.Root, primitives.Tabs),
    DropdownMenu: Object.assign(
      primitives.DropdownMenu.Root,
      primitives.DropdownMenu,
    ),
    ScrollArea: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Spinner: () => null,
    Editor: () => null,
    toast: jest.fn(),
  };
});
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) =>
      typeof fallback === 'string' ? fallback : key,
  }),
}));
jest.mock('ui-modules', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  // Like the real fields: the values live in its own state and are dropped
  // when it unmounts.
  const DataExtensionCreateFields = () => {
    const [value, setValue] = ReactModule.useState('');
    ReactModule.useEffect(() => {
      mockExtension.value = value;
    }, [value]);
    ReactModule.useEffect(
      () => () => {
        mockExtension.value = undefined;
      },
      [],
    );
    return (
      <input
        aria-label="Extension"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    );
  };
  return {
    ...jest.requireActual(
      'ui-modules/modules/widget/record-side-panel/RecordSidePanel',
    ),
    ...jest.requireActual(
      'ui-modules/modules/products/constants/addProductFormSchema',
    ),
    NEW_RECORD_ID: 'new',
    DataExtensionCreateFields,
    FieldsInDetail: () => <div data-testid="properties" />,
    PanelDescriptionField: () => null,
    useFieldGroups: () => ({ fieldGroups: mockFieldGroups }),
    useSidePanel: () => ({
      back: jest.fn(),
      canGoBack: false,
      close: jest.fn(),
    }),
  };
});
jest.mock('ui-modules/modules/products/hooks/useProductFiles', () => ({
  useProductFileLinks: () => ({
    linkFiles: async (files: unknown[] = []) => files,
    linking: false,
  }),
}));
jest.mock('ui-modules/modules/products/hooks/useProductsAdd', () => ({
  useAddProduct: () => ({ productsAdd: mockProductsAdd, loading: false }),
}));
jest.mock('@/side-panel/hooks/useCreatedPanelRecord', () => ({
  useCreatedPanelRecord: () => jest.fn(),
}));
jest.mock('@/products/graphql', () => ({
  productsQueries: { productsMain: 'productsMain' },
}));
// Fills in what Create requires, as the user would on Details.
jest.mock(
  '@/products/product-detail/components/panel/ProductPanelFields',
  () => {
    const ReactModule = jest.requireActual<typeof import('react')>('react');
    return {
      ProductPanelFields: ({
        save,
      }: {
        save: (patch: Record<string, unknown>) => void;
      }) => {
        ReactModule.useEffect(() => {
          save({ name: 'Coffee', code: 'P-01', categoryId: 'c1', uom: 'pcs' });
        }, [save]);
        return null;
      },
    };
  },
);
jest.mock(
  '@/products/product-detail/components/panel/ProductPanelMedia',
  () => ({
    ProductPanelMedia: () => <p>Media content</p>,
  }),
);
jest.mock(
  '@/products/product-detail/components/panel/ProductPanelInventory',
  () => ({ ProductPanelInventory: () => <p>Barcodes content</p> }),
);

const renderPanel = () =>
  render(
    <RecordSidePanel>
      <ProductPanelNew onBack={jest.fn()} onClose={jest.fn()} />
    </RecordSidePanel>,
  );

// Radix selects a tab on mouse down.
const openTab = (name: string) =>
  fireEvent.mouseDown(screen.getByRole('tab', { name }));

const pressCreate = () =>
  fireEvent.click(screen.getByRole('button', { name: 'create-product' }));

describe('ProductPanelNew', () => {
  const clientWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'clientWidth',
  );

  beforeAll(() => {
    // jsdom lays nothing out; a wide bar keeps every tab out of More.
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 1000,
    });
  });

  afterAll(() => {
    if (clientWidth) {
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', clientWidth);
    }
  });

  beforeEach(() => {
    mockProductsAdd.mockReset();
    mockFieldGroups = [];
    delete mockExtension.value;
  });

  it('sends the Data Extension values typed on Details from another tab', async () => {
    let sent: string | undefined;
    mockProductsAdd.mockImplementation(async () => {
      sent = mockExtension.value;
    });
    renderPanel();

    fireEvent.change(screen.getByRole('textbox', { name: 'Extension' }), {
      target: { value: 'Blue' },
    });
    openTab('Media');
    expect(screen.getByText('Media content')).toBeTruthy();
    pressCreate();

    await waitFor(() => expect(mockProductsAdd).toHaveBeenCalledTimes(1));
    expect(sent).toBe('Blue');
  });

  it('holds the properties while Create sends the draft', async () => {
    mockFieldGroups = [{ _id: 'group' }];
    mockProductsAdd.mockReturnValue(new Promise(() => undefined));
    renderPanel();

    openTab('Properties');
    expect(screen.getByTestId('properties').closest('[inert]')).toBeNull();
    pressCreate();

    await waitFor(() => expect(mockProductsAdd).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('properties').closest('[inert]')).not.toBeNull();
  });
});
