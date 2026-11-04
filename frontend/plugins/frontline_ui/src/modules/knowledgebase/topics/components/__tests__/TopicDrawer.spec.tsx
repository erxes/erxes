import {
  useState,
  type InputHTMLAttributes,
  type PropsWithChildren,
} from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { deserialize, serialize } from 'v8';
import { TopicDrawer } from '../TopicDrawer';
import type { ITopic } from '@/knowledgebase/types';

globalThis.structuredClone = (value) => deserialize(serialize(value));
const mockWrite = jest.fn();
const mockQuery = jest.fn();
const mockUploads: Array<(url: string) => void> = [];

jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({ query: mockQuery }),
  useMutation: () => [mockWrite, { loading: false }],
}));
jest.mock('@/knowledgebase/graphql/mutations', () => ({
  ADD_TOPIC: 'add',
  EDIT_TOPIC: 'edit',
}));
jest.mock('@/knowledgebase/graphql/queries', () => ({
  TOPIC_DETAIL: 'detail',
}));
jest.mock('@/knowledgebase/shared/hooks/useKbCloseRemovedRecord', () => ({
  useKbCloseRemovedRecord: () => jest.fn(),
}));
jest.mock('@/knowledgebase/shared/hooks/useKbToast', () => ({
  useKbToast: () => ({
    run: async (action: () => Promise<unknown>) => {
      await action();
      return true;
    },
  }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) =>
      typeof fallback === 'string' ? fallback : key,
  }),
}));
jest.mock('ui-modules', () => ({
  currentUserState: jest
    .requireActual<typeof import('jotai')>('jotai')
    .atom({ _id: 'user-1' }),
  SelectBrand: { FormItem: () => null },
}));
jest.mock('@/knowledgebase/shared/components/KbFormSheet', () => ({
  KbFormSheet: ({
    children,
    onSubmit,
  }: PropsWithChildren<{ onSubmit: () => void }>) => (
    <div>
      {children}
      <button onClick={onSubmit}>Save</button>
    </div>
  ),
}));
jest.mock('@/knowledgebase/shared/components/KbFormLayout', () => {
  const Box = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    KbFormItem: Box,
    KbFormSection: Object.assign(Box, { Content: Box }),
    KbFormPanelContext: jest
      .requireActual<typeof import('react')>('react')
      .createContext(false),
  };
});
jest.mock('erxes-ui', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const Box = ({ children }: PropsWithChildren) => <div>{children}</div>;
  const UploadContext = React.createContext<{
    onChange: (file: { url: string }) => void;
  } | null>(null);
  const UploadRoot = ({
    children,
    onChange,
  }: PropsWithChildren<{ onChange: (file: { url: string }) => void }>) => (
    <UploadContext.Provider value={{ onChange }}>
      {children}
    </UploadContext.Provider>
  );
  const UploadPreview = ({ onUploadStart }: { onUploadStart?: () => void }) => {
    const context = React.useContext(UploadContext);
    return (
      <button
        type="button"
        onClick={() => {
          onUploadStart?.();
          mockUploads.push((url) => context?.onChange({ url }));
        }}
      >
        Start background upload
      </button>
    );
  };
  const RemoveUpload = () => {
    const context = React.useContext(UploadContext);
    return (
      <button type="button" onClick={() => context?.onChange({ url: '' })}>
        Remove background
      </button>
    );
  };
  return {
    Form: Object.assign(Box, {
      Field:
        jest.requireActual<typeof import('react-hook-form')>('react-hook-form')
          .Controller,
      Control: Box,
      Message: () => null,
      Description: Box,
    }),
    Input: React.forwardRef<
      HTMLInputElement,
      InputHTMLAttributes<HTMLInputElement>
    >((props, ref) => <input {...props} ref={ref} />),
    Textarea: 'textarea',
    ColorPicker: () => null,
    cn: () => '',
    Select: Object.assign(Box, {
      Trigger: Box,
      Value: Box,
      Content: Box,
      Item: Box,
    }),
    Upload: {
      Root: UploadRoot,
      Preview: UploadPreview,
      Button: Box,
      RemoveButton: RemoveUpload,
    },
    isDeeplyEqual:
      jest.requireActual<typeof import('deep-equal')>('deep-equal'),
    useConfirm: () => ({ confirm: () => new Promise<void>(() => undefined) }),
  };
});

const topic: ITopic = {
  _id: 'topic-1',
  title: 'Topic',
  code: null,
  description: null,
  color: '#4F46E5',
  backgroundImage: 'original.png',
  languageCode: null,
  notificationSegmentId: null,
  createdBy: null,
  createdDate: null,
  modifiedBy: null,
  modifiedDate: null,
  brand: null,
  categories: [],
};
const TopicPanel = () => {
  const [activity, setActivity] = useState(false);
  return (
    <>
      <button onClick={() => setActivity(!activity)}>
        {activity ? 'Details' : 'Activity'}
      </button>
      {activity ? (
        <p>Activity empty state</p>
      ) : (
        <TopicDrawer topic={topic} onClose={jest.fn()} />
      )}
    </>
  );
};
beforeEach(() => {
  jest.clearAllMocks();
  mockUploads.length = 0;
  mockQuery.mockResolvedValue({ data: { knowledgeBaseTopicDetail: topic } });
  mockWrite.mockResolvedValue({});
});
const save = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  });
};

it('saves a topic background upload completed while Activity unmounts Details', async () => {
  render(
    <Provider>
      <TopicPanel />
    </Provider>,
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Start background upload' }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Activity' }));
  act(() => mockUploads[0]('late-background.png'));
  fireEvent.click(screen.getByRole('button', { name: 'Details' }));
  await save();
  expect(mockWrite).toHaveBeenCalledWith({
    variables: {
      _id: 'topic-1',
      doc: { title: 'Topic', backgroundImage: 'late-background.png' },
    },
  });
});

it('keeps a removed topic background clear when an old upload completes after remount', async () => {
  render(
    <Provider>
      <TopicPanel />
    </Provider>,
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Start background upload' }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Activity' }));
  fireEvent.click(screen.getByRole('button', { name: 'Details' }));
  fireEvent.click(screen.getByRole('button', { name: 'Remove background' }));
  act(() => mockUploads[0]('obsolete-background.png'));
  await save();
  expect(mockWrite).toHaveBeenCalledWith({
    variables: { _id: 'topic-1', doc: { title: 'Topic', backgroundImage: '' } },
  });
});

it('keeps the newest topic background selection across Activity and reversed completions', async () => {
  render(
    <Provider>
      <TopicPanel />
    </Provider>,
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Start background upload' }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Activity' }));
  fireEvent.click(screen.getByRole('button', { name: 'Details' }));
  fireEvent.click(
    screen.getByRole('button', { name: 'Start background upload' }),
  );
  act(() => mockUploads[1]('latest-background.png'));
  act(() => mockUploads[0]('obsolete-background.png'));
  await save();
  expect(mockWrite).toHaveBeenCalledWith({
    variables: {
      _id: 'topic-1',
      doc: { title: 'Topic', backgroundImage: 'latest-background.png' },
    },
  });
});

it('keeps a confirmed topic create and pending background when New is reopened', async () => {
  const store = createStore();
  mockWrite.mockResolvedValue({
    data: { knowledgeBaseTopicsAdd: { _id: 'created-topic' } },
  });
  mockQuery.mockResolvedValue({
    data: {
      knowledgeBaseTopicDetail: {
        ...topic,
        _id: 'created-topic',
        title: 'Created topic',
        backgroundImage: '',
      },
    },
  });
  const mount = () =>
    render(
      <Provider store={store}>
        <TopicDrawer onClose={jest.fn()} />
      </Provider>,
    );
  const first = mount();
  fireEvent.change(screen.getByPlaceholderText('Enter topic title'), {
    target: { value: 'Created topic' },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'Start background upload' }),
  );
  await save();
  first.unmount();
  mount();
  expect(
    screen.getByPlaceholderText<HTMLInputElement>('Enter topic title').value,
  ).toBe('Created topic');
  act(() => mockUploads[0]('late-created-background.png'));
  await save();
  expect(mockWrite).toHaveBeenCalledTimes(2);
  expect(mockWrite).toHaveBeenLastCalledWith({
    variables: {
      _id: 'created-topic',
      doc: {
        title: 'Created topic',
        backgroundImage: 'late-created-background.png',
      },
    },
  });
});
