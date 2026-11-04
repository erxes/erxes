import '~/widgets/record-panel/__tests__/fixtures/ticketPanelDependencies';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { KbImageUpload } from '@/knowledgebase/shared/components/TopicAppearanceFields';

const mockFinishes: (() => void)[] = [];
jest.mock('erxes-ui', () => {
  const { createContext, useContext } =
    jest.requireActual<typeof import('react')>('react');
  const UploadContext = createContext<(mockValue: { url: string }) => void>(
    () => undefined,
  );
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    Upload: {
      Root: ({
        children,
        onChange,
      }: PropsWithChildren<{ onChange: (value: { url: string }) => void }>) => (
        <UploadContext.Provider value={onChange}>
          {children}
        </UploadContext.Provider>
      ),
      Preview: ({ onUploadStart }: { onUploadStart: () => void }) => {
        const complete = useContext(UploadContext);
        return (
          <button
            onClick={() => {
              const url = `${mockFinishes.length + 1}.png`;
              onUploadStart();
              mockFinishes.push(() => complete({ url }));
            }}
          >
            Select image
          </button>
        );
      },
      Button: Container,
      RemoveButton: () => {
        const change = useContext(UploadContext);
        return (
          <button onClick={() => change({ url: '' })}>Remove image</button>
        );
      },
    },
  };
});
jest.mock('@/knowledgebase/shared/components/ColorDefaultAction', () => ({
  ColorDefaultAction: () => null,
}));

it('retains each upload writer when selecting another image before the first finishes', async () => {
  const first = jest.fn();
  const second = jest.fn();
  const capture = jest
    .fn()
    .mockReturnValueOnce(first)
    .mockReturnValueOnce(second);
  render(
    <KbImageUpload
      value=""
      onChange={jest.fn()}
      buttonLabel="Logo"
      captureChange={capture}
    />,
  );
  fireEvent.click(screen.getByText('Select image'));
  fireEvent.click(screen.getByText('Select image'));
  await act(() => Promise.resolve(mockFinishes[0]()));
  await act(() => Promise.resolve(mockFinishes[1]()));
  expect(first).toHaveBeenCalledWith('1.png');
  expect(second).toHaveBeenCalledWith('2.png');
});

it('invalidates an upload before applying an explicit image removal', () => {
  const invalidate = jest.fn();
  const change = jest.fn(() => expect(invalidate).toHaveBeenCalledTimes(1));
  render(
    <KbImageUpload
      value="old.png"
      onChange={change}
      buttonLabel="Logo"
      invalidateChange={invalidate}
    />,
  );
  fireEvent.click(screen.getByText('Remove image'));
  expect(change).toHaveBeenCalledWith('');
});
