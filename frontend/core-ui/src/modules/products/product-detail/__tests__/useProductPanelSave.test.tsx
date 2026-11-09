/** @jest-environment jsdom */
import { InMemoryCache } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { productsMutations } from '@/products/graphql';
import { PRODUCT_DETAIL_QUERY } from '@/products/product-detail/graphql/queries/productDetailQueries';
import { useProductPanelSave } from '@/products/product-detail/hooks/useProductPanelSave';

const mockToast = jest.fn();
const mockLinkFiles = jest.fn(async (items: unknown[] = []) => items);

// The product queries are built from the cursor fragments.
jest.mock('erxes-ui', () => ({
  ...jest.requireActual('erxes-ui/constants/GraphqlConstants'),
  useToast: () => ({ toast: mockToast }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('ui-modules/modules/products/hooks/useProductFiles', () => ({
  useProductFileLinks: () => ({ linkFiles: mockLinkFiles }),
}));
jest.mock('ui-modules/modules/products/components/ProductImageUploads', () => ({
  toProductAttachmentList: (value: unknown) =>
    Array.isArray(value) ? value : [],
}));

const PRODUCT = {
  __typename: 'Product',
  _id: 'p1',
  name: 'Coffee',
  shortName: '',
  type: 'product',
  code: 'P-1',
  categoryId: 'c1',
  vendorId: '',
  conditionCodes: [],
  scopeBrandIds: [],
  tagIds: [],
  status: 'active',
  description: '',
  unitPrice: 10,
  weight: null,
  duration: null,
  durationType: null,
  barcodes: ['111'],
  variants: { '111': {} },
  barcodeDescription: '',
  createdAt: null,
  currency: 'MNT',
  attachment: null,
  attachmentMore: [],
  videos: [],
  files: [],
  pdfAttachment: null,
  uom: 'pcs',
  subUoms: [],
  propertiesData: {},
  similarityId: null,
  similarity: null,
};

type TProduct = typeof PRODUCT;

const cacheWithProduct = () => {
  const cache = new InMemoryCache();
  cache.writeQuery({
    query: PRODUCT_DETAIL_QUERY,
    variables: { _id: 'p1' },
    data: { productDetail: PRODUCT },
  });
  return cache;
};

// Answers one `productsEdit` call, recording what was sent.
const editMock = (
  sent: Record<string, unknown>[],
  next: TProduct,
): MockedResponse => ({
  request: { query: productsMutations.productsEdit },
  variableMatcher: (variables) => {
    sent.push(variables as Record<string, unknown>);
    return true;
  },
  // Apollo keeps only the fields the mutation selects.
  result: { data: { productsEdit: next } },
});

const renderSave = (cache: InMemoryCache, mocks: MockedResponse[]) =>
  renderHook(() => useProductPanelSave('p1'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MockedProvider cache={cache} mocks={mocks}>
        {children}
      </MockedProvider>
    ),
  });

describe('useProductPanelSave', () => {
  beforeEach(() => mockToast.mockClear());

  it('sends the whole product with the change on top', async () => {
    const sent: Record<string, unknown>[] = [];
    const renamed = { ...PRODUCT, name: 'Latte' };
    const { result } = renderSave(cacheWithProduct(), [
      editMock(sent, renamed),
    ]);

    let saved: unknown;
    await act(async () => {
      saved = await result.current.save({ name: 'Latte' });
    });

    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      _id: 'p1',
      name: 'Latte',
      code: 'P-1',
      categoryId: 'c1',
      unitPrice: 10,
      uom: 'pcs',
      barcodes: ['111'],
      variants: { '111': {} },
      attachment: null,
    });
    expect(saved).toMatchObject({ _id: 'p1', name: 'Latte' });
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('never sends the conditions back', async () => {
    const sent: Record<string, unknown>[] = [];
    const withConditions = { ...PRODUCT, conditionCodes: ['A'] };
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: PRODUCT_DETAIL_QUERY,
      variables: { _id: 'p1' },
      data: { productDetail: withConditions },
    });
    const { result } = renderSave(cache, [
      editMock(sent, { ...withConditions, name: 'Latte' }),
    ]);

    await act(async () => {
      await result.current.save({ name: 'Latte' });
    });

    expect(sent).toHaveLength(1);
    expect(sent[0]).not.toHaveProperty('conditionCodes');
  });

  it('sends cached videos without Apollo metadata', async () => {
    const sent: Record<string, unknown>[] = [];
    const video = {
      __typename: 'Attachment',
      url: 'https://cdn/clip.mp4',
      name: 'clip.mp4',
      size: 2048,
      type: 'video/mp4',
      duration: 12,
    };
    const withVideo = { ...PRODUCT, videos: [video] };
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: PRODUCT_DETAIL_QUERY,
      variables: { _id: 'p1' },
      data: { productDetail: withVideo },
    });
    const { result } = renderSave(cache, [editMock(sent, withVideo)]);

    await act(async () => {
      await result.current.save({ name: 'Latte' });
    });

    expect(sent[0].videos).toEqual([
      {
        url: 'https://cdn/clip.mp4',
        name: 'clip.mp4',
        size: 2048,
        type: 'video/mp4',
        duration: 12,
      },
    ]);
  });

  it('keeps saving after a save throws', async () => {
    const sent: Record<string, unknown>[] = [];
    const renamed = { ...PRODUCT, name: 'Latte' };
    const { result } = renderSave(cacheWithProduct(), [
      editMock(sent, renamed),
    ]);

    mockLinkFiles.mockRejectedValueOnce(new Error('offline'));

    await act(async () => {
      await expect(result.current.save({ name: 'Mocha' })).rejects.toThrow(
        'offline',
      );
    });

    let saved: unknown;
    await act(async () => {
      saved = await result.current.save({ name: 'Latte' });
    });

    expect(sent).toHaveLength(1);
    expect(saved).toMatchObject({ name: 'Latte' });
  });

  it('builds each save on the one before it', async () => {
    const sent: Record<string, unknown>[] = [];
    const renamed = { ...PRODUCT, name: 'Latte' };
    const repriced = { ...renamed, unitPrice: 12 };
    const { result } = renderSave(cacheWithProduct(), [
      editMock(sent, renamed),
      editMock(sent, repriced),
    ]);

    await act(async () => {
      await Promise.all([
        result.current.save({ name: 'Latte' }),
        result.current.save({ unitPrice: 12 }),
      ]);
    });

    expect(sent).toHaveLength(2);
    expect(sent[1]).toMatchObject({ name: 'Latte', unitPrice: 12 });
  });

  it('saves nothing when the change is invalid', async () => {
    const sent: Record<string, unknown>[] = [];
    const { result } = renderSave(cacheWithProduct(), [
      editMock(sent, PRODUCT),
    ]);

    let saved: unknown;
    await act(async () => {
      saved = await result.current.save({ type: 'unique' });
    });

    expect(saved).toBeNull();
    expect(sent).toHaveLength(0);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'validationErrorTitle',
        variant: 'destructive',
      }),
    );
  });

  it('reports a failed save', async () => {
    const { result } = renderSave(cacheWithProduct(), [
      {
        request: { query: productsMutations.productsEdit },
        variableMatcher: () => true,
        error: new Error('Code does not match the category mask'),
      },
    ]);

    let saved: unknown;
    await act(async () => {
      saved = await result.current.save({ code: 'X' });
    });

    expect(saved).toBeNull();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Code does not match the category mask',
        variant: 'destructive',
      }),
    );
  });
});
