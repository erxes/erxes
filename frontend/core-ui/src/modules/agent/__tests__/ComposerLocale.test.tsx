/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { toast } from 'erxes-ui';

import { Composer } from '../components/Composer';
import { initAgentI18n, readCommonLocale } from './support/agentI18n';

jest.mock('../components/PageElementPicker', () => ({
  PageElementPicker: () => null,
}));
jest.mock(
  'erxes-ui',
  () => {
    const Wrapper = ({ children }: { children: ReactNode }): ReactNode =>
      children;
    return {
      toast: jest.fn(),
      Spinner: () => <span />,
      Button: ({
        variant: _variant,
        size: _size,
        ...props
      }: ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: string;
        size?: string;
      }) => {
        void _variant;
        void _size;
        return <button {...props} />;
      },
      Tooltip: Object.assign(Wrapper, {
        Provider: Wrapper,
        Trigger: Wrapper,
        Content: Wrapper,
      }),
    };
  },
  { virtual: true },
);
jest.mock('../uploadAgentsFile', () => ({ uploadAgentsFile: jest.fn() }));
jest.mock('../utils/resizeAgentsImage', () => ({
  resizeAgentsImage: jest.fn(),
}));

const notify = jest.mocked(toast);
const mn = readCommonLocale('mn').agent;

initAgentI18n('mn');
beforeEach(() => notify.mockReset());

const pasteImage = () =>
  fireEvent.paste(screen.getByRole('textbox'), {
    clipboardData: {
      types: ['Files'],
      files: [new File(['png'], 'image.png', { type: 'image/png' })],
      items: [],
    },
  });

it('explains a refused paste in Mongolian while a response streams', () => {
  render(
    <Composer
      status="streaming"
      disabled={false}
      onSend={jest.fn()}
      onStop={jest.fn()}
    />,
  );
  pasteImage();
  expect(notify).toHaveBeenCalledWith({
    title: mn['attach-not-attached'],
    description: mn['paste-wait-for-response'],
  });
});

it('says attachments are unavailable in Mongolian when the composer is disabled', () => {
  render(
    <Composer status="ready" disabled onSend={jest.fn()} onStop={jest.fn()} />,
  );
  pasteImage();
  expect(notify).toHaveBeenCalledWith({
    title: mn['attach-not-attached'],
    description: mn['attach-unavailable'],
  });
});

it('titles rejected attachments in Mongolian', () => {
  render(
    <Composer
      status="ready"
      disabled={false}
      onSend={jest.fn()}
      onStop={jest.fn()}
    />,
  );
  fireEvent.change(
    screen.getByLabelText(/./, { selector: 'input[type=file]' }),
    {
      target: {
        files: [new File(['zip'], 'archive.zip', { type: 'application/zip' })],
      },
    },
  );
  expect(notify).toHaveBeenCalledWith(
    expect.objectContaining({
      title: mn['attach-not-attached'],
      variant: 'destructive',
    }),
  );
});
