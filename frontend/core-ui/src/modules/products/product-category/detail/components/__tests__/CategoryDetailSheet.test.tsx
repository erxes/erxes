/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '../../../add-category/components/formSchema';
import { CategoryDetailSheet } from '../CategoryDetailSheet';

let mockCategoryId: string | null = 'category-a';
const mockSetCategoryId = jest.fn();
const mockEdit = jest.fn();
jest.mock('@/products/components/ProductEditorPanel', () => ({
  ProductEditorPanel: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  ProductEditorHeader: () => <header>Edit category</header>,
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const Container = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    Button: (props: React.ComponentProps<'button'>) => <button {...props} />,
    Form: Container,
    ScrollArea: Container,
    Sheet: { Content: Container, Footer: Container },
    useToast: () => ({ toast: jest.fn() }),
    useSetHotkeyScope: () => jest.fn(),
    useQueryState: () => [mockCategoryId, mockSetCategoryId],
  };
});
jest.mock('ui-modules', () => ({ toProductAttachmentItem: () => null }));
jest.mock('../../hooks/useUpdateCategory', () => ({
  useProductCategoriesEdit: () => ({
    productCategoriesEdit: mockEdit,
    loading: false,
  }),
}));
jest.mock('../../hooks/useCategoryDetail', () => ({
  useProductCategoryDetail: () => ({
    categoryDetail: { _id: mockCategoryId, name: mockCategoryId, code: 'code' },
    loading: false,
  }),
}));
jest.mock('../CategoryUpdateCoreFields', () => ({
  CategoriesUpdateCoreFields: ({
    form,
  }: {
    form: UseFormReturn<ProductFormValues>;
  }) => {
    const { useEffect } = jest.requireActual<typeof import('react')>('react');
    useEffect(
      () => form.reset({ name: mockCategoryId || '', code: 'code' }),
      [form, mockCategoryId],
    );
    return <input aria-label="Category name" {...form.register('name')} />;
  },
}));
jest.mock('../CategoryUpdateMoreFields', () => ({
  CategoryUpdateMoreFields: () => null,
}));

beforeEach(() => {
  mockCategoryId = 'category-a';
  mockSetCategoryId.mockClear();
  mockEdit.mockClear();
});

it('keeps another category draft open when an earlier save completes', async () => {
  const view = render(<CategoryDetailSheet />);
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'save' }));
  });
  expect(mockEdit).toHaveBeenCalledTimes(1);
  const pendingSave = mockEdit.mock.calls[0][0] as { onCompleted: () => void };
  mockCategoryId = 'category-b';
  view.rerender(<CategoryDetailSheet />);
  fireEvent.change(screen.getByLabelText('Category name'), {
    target: { value: 'Unsaved B' },
  });
  act(() => pendingSave.onCompleted());
  expect(mockSetCategoryId).not.toHaveBeenCalled();
  expect(screen.getByLabelText<HTMLInputElement>('Category name').value).toBe(
    'Unsaved B',
  );
});
