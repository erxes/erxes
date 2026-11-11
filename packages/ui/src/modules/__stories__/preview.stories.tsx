import { Meta, StoryObj } from '@storybook/react';
import { Preview } from '../preview/components/Preview';

import { cn } from 'erxes-ui/lib/utils';
import { MemoryRouter } from 'react-router-dom';

interface PreviewProps {
  className?: string;
  children?: React.ReactNode;
  url?: string;
}

const PreviewStory = ({
  className,
  url = '/iframe.html?id=components-dialog--default',
}: PreviewProps) => {
  return (
    <MemoryRouter>
      <div
        className={cn(
          'h-[calc(100vh-32px)] w-[calc(100vw-32px)] flex flex-col',
          className,
        )}
      >
        <Preview>
          <Preview.Toolbar path={url} />
          <Preview.View
            iframeSrc="/iframe.html?id=components-dialog--default"
            height={400}
          />
        </Preview>
      </div>
    </MemoryRouter>
  );
};

export default {
  title: 'UI/Preview',
  component: PreviewStory,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof PreviewStory>;

type Story = StoryObj<typeof PreviewStory>;

export const Default: Story = {
  args: {},
};

export const WithCustomURL: Story = {
  args: {
    url: '/iframe.html?id=components-button--default',
  },
};
