/** @jest-environment jsdom */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ProductRecordPanel } from '../ProductRecordPanel';

const mockProduct = {
  _id: 'product-1',
  name: 'Product',
  code: 'P1',
  categoryId: 'category-1',
  type: 'product',
  unitPrice: 10,
  attachment: { url: 'saved-image', name: 'Image' },
  attachmentMore: [],
  videos: [{ url: 'saved-video', name: 'Video' }],
  files: [],
};
const mockProductsEdit = jest.fn().mockResolvedValue({});
const mockRemoveFile = jest.fn(
  async (_name: string, callback: (status: string) => void) => callback('ok'),
);
beforeEach(() => {
  mockProductsEdit.mockReset().mockResolvedValue({});
  mockRemoveFile.mockClear();
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));
jest.mock('erxes-ui', () => {
  const { FormProvider } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const Container = ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  );
  return {
    Form: FormProvider,
    useRemoveFile: () => ({ removeFile: mockRemoveFile }),
    Button: ({
      children,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button {...props}>{children}</button>
    ),
    InfoCard: Object.assign(Container, { Content: Container }),
    ScrollArea: Container,
    Spinner: () => null,
    toast: jest.fn(),
  };
});
jest.mock('ui-modules', () => ({
  toProductAttachmentList: jest.requireMock(
    'ui-modules/modules/products/components/ProductImageUploads',
  ).toProductAttachmentList,
  NEW_RECORD_ID: 'new',
  usePanelExpanded: () => false,
  usePermissionCheck: () => ({ hasActionPermission: () => true }),
  useProductFileLinks: () => ({
    linkFiles: (files: unknown[]) => Promise.resolve(files),
  }),
  PrintDocument: () => null,
  FieldsInDetail: () => null,
  AddInternalNote: () => null,
  ActivityLogs: () => null,
  RecordSidePanel: {
    Header: () => null,
    Layout: ({
      tabs,
    }: {
      tabs: { value: string; content: React.ReactNode }[];
    }) => <>{tabs.find((tab) => tab.value === 'overview')?.content}</>,
  },
}));
jest.mock('@/widgets/hooks/useFormWidgetTabs', () => ({
  useFormWidgetTabs: () => [],
}));
jest.mock('@/products/components/ProductPanelNew', () => ({
  ProductPanelNew: () => null,
}));
jest.mock('@/products/hooks/useProductsEdit', () => ({
  useProductsEdit: () => ({ productsEdit: mockProductsEdit, loading: false }),
}));
jest.mock('@/products/product-detail/hooks/useProductDetailWithQuery', () => ({
  useProductDetailWithQuery: () => ({
    productDetail: mockProduct,
    productId: mockProduct._id,
    loading: false,
    refetch: jest.fn(),
  }),
}));
jest.mock('@/products/product-detail/hooks/useProductCustomFieldEdit', () => ({
  useProductCustomFieldEdit: jest.fn(),
}));
jest.mock('@/products/product-detail/components/ProductActivityRows', () => ({
  productCustomActivities: {},
}));
jest.mock(
  '@/products/product-detail/components/ProductDetailSimilarity',
  () => ({ ProductDetailSimilarity: () => null }),
);
jest.mock('@/products/graphql', () => ({
  productsQueries: { productsMain: 'productsMain' },
}));
jest.mock('../ProductDetailGeneral', () => ({
  ProductDetailGeneral: () => null,
}));
jest.mock('../ProductDetailBarcode', () => ({
  ProductDetailBarcode: () => null,
}));
jest.mock('../ProductDetailUom', () => ({ ProductDetailUom: () => null }));
jest.mock('../ProductDetailInfo', () => ({ ProductDetailInfo: () => null }));
jest.mock('ui-modules/modules/products/components/ProductImageUploads', () => ({
  PRODUCT_SECONDARY_IMAGE_LIMIT: 5,
  toProductAttachmentItem: jest.requireActual(
    'ui-modules/modules/products/components/ProductImageUploads',
  ).toProductAttachmentItem,
  toProductAttachmentList: jest.requireActual(
    'ui-modules/modules/products/components/ProductImageUploads',
  ).toProductAttachmentList,
  ProductPrimaryImageUpload: ({
    value,
    onChange,
    deleteOnRemove = true,
  }: {
    value: { url: string; name?: string } | null;
    onChange: (value: { url: string } | null) => void;
    deleteOnRemove?: boolean;
  }) => (
    <>
      <input
        aria-label="Product image"
        value={value?.url || ''}
        onChange={(event) => onChange({ url: event.target.value })}
      />
      <button
        type="button"
        onClick={() => {
          if (deleteOnRemove)
            void mockRemoveFile(value?.name || value?.url || '', () =>
              onChange(null),
            );
          else onChange(null);
        }}
      >
        Remove image
      </button>
    </>
  ),
  ProductSecondaryImagesUpload: () => null,
}));
jest.mock('ui-modules/modules/products/components/ProductVideoUploads', () => ({
  PRODUCT_VIDEO_LIMIT: 5,
  ProductVideosUpload: ({
    value,
    onChange,
  }: {
    value: { url: string }[];
    onChange: (value: { url: string }[]) => void;
  }) => (
    <input
      aria-label="Product video"
      value={value[0]?.url || ''}
      onChange={(event) => onChange([{ url: event.target.value }])}
    />
  ),
}));
jest.mock('ui-modules/modules/products/components/ProductFilesUpload', () => ({
  ProductFilesUpload: () => null,
}));

it('restores media controls and the saved payload when Cancel resets the product form', async () => {
  render(
    <ProductRecordPanel
      record={{ contentType: 'core:product', contentId: mockProduct._id }}
      onClose={jest.fn()}
    />,
  );
  const image = await screen.findByRole('textbox', { name: 'Product image' });
  fireEvent.change(image, { target: { value: 'unsaved-image' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Product video' }), {
    target: { value: 'unsaved-video' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(
    (screen.getByRole('textbox', { name: 'Product image' }) as HTMLInputElement)
      .value,
  ).toBe('saved-image');
  expect(
    (screen.getByRole('textbox', { name: 'Product video' }) as HTMLInputElement)
      .value,
  ).toBe('saved-video');
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mockProductsEdit).toHaveBeenCalled());
  expect(mockProductsEdit.mock.calls[0][0].variables).toMatchObject({
    attachment: { url: 'saved-image' },
    videos: [{ url: 'saved-video' }],
  });
});

it('keeps a removed persisted image on storage when the user cancels', async () => {
  render(
    <ProductRecordPanel
      record={{ contentType: 'core:product', contentId: mockProduct._id }}
      onClose={jest.fn()}
    />,
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Remove image' }));
  expect(mockRemoveFile).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(
    (screen.getByRole('textbox', { name: 'Product image' }) as HTMLInputElement)
      .value,
  ).toBe('saved-image');
  expect(mockRemoveFile).not.toHaveBeenCalled();
});

it('deletes removed persisted media only after product save succeeds', async () => {
  render(
    <ProductRecordPanel
      record={{ contentType: 'core:product', contentId: mockProduct._id }}
      onClose={jest.fn()}
    />,
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Remove image' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mockProductsEdit).toHaveBeenCalled());
  expect(mockRemoveFile).not.toHaveBeenCalled();
  const options = mockProductsEdit.mock.calls[0][0];
  expect(options.variables.attachment).toBeNull();
  await act(async () =>
    options.onCompleted({
      productsEdit: {
        attachment: null,
        attachmentMore: [],
        videos: mockProduct.videos,
        files: [],
      },
    }),
  );
  expect(mockRemoveFile).toHaveBeenCalledWith('Image', expect.any(Function));
});

it('preserves storage media that the mutation response still references', async () => {
  render(
    <ProductRecordPanel
      record={{ contentType: 'core:product', contentId: mockProduct._id }}
      onClose={jest.fn()}
    />,
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Remove image' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mockProductsEdit).toHaveBeenCalled());
  await act(async () =>
    mockProductsEdit.mock.calls[0][0].onCompleted({
      productsEdit: mockProduct,
    }),
  );
  expect(mockRemoveFile).not.toHaveBeenCalled();
});

it('leaves removed persisted media intact when product save fails', async () => {
  mockProductsEdit.mockImplementationOnce(
    ({ onError }: { onError: (error: Error) => void }) => {
      onError(new Error('Save failed'));
      return Promise.resolve({});
    },
  );
  render(
    <ProductRecordPanel
      record={{ contentType: 'core:product', contentId: mockProduct._id }}
      onClose={jest.fn()}
    />,
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Remove image' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mockProductsEdit).toHaveBeenCalled());
  expect(mockRemoveFile).not.toHaveBeenCalled();
});
