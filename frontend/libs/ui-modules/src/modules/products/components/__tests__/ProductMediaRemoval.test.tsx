/** @jest-environment jsdom */
import { fireEvent, render, waitFor } from '@testing-library/react';
import {
  ProductPrimaryImageUpload,
  ProductSecondaryImagesUpload,
} from '../ProductImageUploads';
import { ProductVideosUpload } from '../ProductVideoUploads';

const mockRemoveFile = jest.fn(
  async (_name: string, callback: (status: string) => void) => callback('ok'),
);
jest.mock('@apollo/client', () => ({
  gql: jest.requireActual('@apollo/client').gql,
  useQuery: () => ({
    data: { configsFileUploadInfo: { videoUploadEnabled: false } },
  }),
}));
jest.mock('erxes-ui', () => {
  const Container = ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  );
  return {
    readImage: (url: string) => url,
    useRemoveFile: () => ({ removeFile: mockRemoveFile, isLoading: false }),
    useErxesUpload: () => ({
      files: [],
      loading: false,
      errors: [],
      open: jest.fn(),
      onUpload: jest.fn(),
      getInputProps: () => ({}),
    }),
    useUploadChunked: () => ({
      upload: jest.fn(),
      progress: 0,
      loading: false,
    }),
    parseVideoEmbedUrl: () => null,
    getCloudflareStreamBase: () => null,
    Button: Container,
    Input: () => null,
    Popover: Object.assign(Container, {
      Trigger: Container,
      Content: Container,
    }),
    Dialog: Object.assign(Container, { Content: Container }),
  };
});

const item = {
  url: 'saved-file',
  name: 'saved-file',
  type: 'image/png',
  size: 10,
};

beforeEach(() => jest.clearAllMocks());

it.each(
  (['primary', 'secondary', 'video'] as const).flatMap((kind) => [
    { kind, deferred: true },
    { kind, deferred: false },
  ]),
)(
  'removes $kind with deferred=$deferred without changing the default contract',
  async ({ kind, deferred }) => {
    const onChange = jest.fn();
    const options = deferred ? { deleteOnRemove: false } : {};
    let control = (
      <ProductVideosUpload value={[item]} onChange={onChange} {...options} />
    );
    if (kind === 'primary') {
      control = (
        <ProductPrimaryImageUpload
          value={item}
          onChange={onChange}
          {...options}
        />
      );
    } else if (kind === 'secondary') {
      control = (
        <ProductSecondaryImagesUpload
          value={[item]}
          onChange={onChange}
          {...options}
        />
      );
    }
    const view = render(control);
    const remove = view.container.querySelector('button.bg-destructive');
    if (!remove) throw new Error('Media removal button is missing');
    fireEvent.click(remove);
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(kind === 'primary' ? null : []),
    );
    if (deferred) expect(mockRemoveFile).not.toHaveBeenCalled();
    else
      expect(mockRemoveFile).toHaveBeenCalledWith(
        item.name,
        expect.any(Function),
      );
  },
);
