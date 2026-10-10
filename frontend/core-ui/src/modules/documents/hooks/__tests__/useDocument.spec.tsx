import { useMutation, useQuery } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { FormProvider, UseFormReturn, useForm } from 'react-hook-form';
import { toast } from 'erxes-ui';
import { IDocument } from '../../types';
import { useDocument } from '../useDocument';
import { FormType } from '../useDocumentForm';

const mockSelection = { documentId: ' ', contentType: 'core:product' };
const mockSetDocumentId = jest.fn();
const mockSave = jest.fn<
  Promise<void>,
  [{ onCompleted: (data: { documentsSave: IDocument }) => void }]
>();

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));
jest.mock('erxes-ui', () => ({
  toast: jest.fn(),
  useQueryState: (key: keyof typeof mockSelection) => [
    mockSelection[key],
    mockSetDocumentId,
  ],
}));
jest.mock('../../graphql/queries', () => ({
  GET_DOCUMENTS: {},
  GET_DOCUMENT_DETAIL: {},
}));

const draft = {
  name: 'Template',
  content: '[{"type":"paragraph","content":"Before save"}]',
  contentType: 'core:product',
  commentData: '{"threads":[],"anchors":[]}',
};
let form: UseFormReturn<FormType>;

function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
  form = useForm<FormType>({ defaultValues: draft });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe('document save selection and hydration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockSelection.documentId = ' ';
    mockSave.mockResolvedValue();
    (useMutation as jest.Mock).mockReturnValue([mockSave, { loading: false }]);
    (useQuery as jest.Mock).mockReturnValue({ loading: false });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('preserves edits made during the first save when the saved ID loads', () => {
    const { result, rerender } = renderHook(
      () => ({ ...useDocument(), isDirty: form.formState.isDirty }),
      { wrapper: Wrapper },
    );
    act(() => result.current.documentSave());
    const newerContent = '[{"type":"paragraph","content":"Newer edit"}]';
    act(() => {
      form.setValue('name', 'Newer title', { shouldDirty: true });
      form.setValue('content', newerContent, { shouldDirty: true });
      mockSave.mock.calls[0][0].onCompleted({
        documentsSave: { ...draft, _id: 'saved-document' },
      });
      jest.runOnlyPendingTimers();
    });
    expect(mockSetDocumentId).toHaveBeenCalledWith('saved-document');

    mockSelection.documentId = 'saved-document';
    (useQuery as jest.Mock).mockReturnValue({
      data: { documentsDetail: { ...draft, _id: 'saved-document' } },
      loading: false,
    });
    rerender();

    expect(form.getValues()).toMatchObject({
      _id: 'saved-document',
      name: 'Newer title',
      content: newerContent,
    });
    expect(result.current.isDirty).toBe(true);
  });

  it('ignores a completed save after another document is selected', () => {
    const { result, rerender } = renderHook(() => useDocument(), {
      wrapper: Wrapper,
    });
    act(() => result.current.documentSave());
    mockSelection.documentId = 'another-document';
    rerender();
    act(() => {
      mockSave.mock.calls[0][0].onCompleted({
        documentsSave: { ...draft, _id: 'saved-document' },
      });
      jest.runOnlyPendingTimers();
    });
    expect(toast).not.toHaveBeenCalled();
    expect(mockSetDocumentId).not.toHaveBeenCalled();
    expect(form.getValues()).toEqual(draft);
  });

  it('hydrates a different document after a save', () => {
    mockSelection.documentId = 'another-document';
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        documentsDetail: {
          ...draft,
          _id: 'another-document',
          name: 'Another template',
        },
      },
      loading: false,
    });
    renderHook(() => useDocument(), { wrapper: Wrapper });
    expect(form.getValues()).toMatchObject({
      _id: 'another-document',
      name: 'Another template',
    });
  });
});
