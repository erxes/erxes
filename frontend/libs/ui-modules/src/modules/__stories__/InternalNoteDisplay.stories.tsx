import type { Meta, StoryObj } from '@storybook/react';
import { InternalNoteDisplay } from 'frontend/libs/ui-modules/src/modules/internal-notes/components/InternalNoteDisplay';

const meta: Meta<typeof InternalNoteDisplay> = {
  title: 'Modules/InternalNotes/InternalNoteDisplay',
  component: InternalNoteDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-lg w-full p-4 border rounded bg-background">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof InternalNoteDisplay>;

export const Default: Story = {
  args: {
    content: 'This is a simple internal note.',
  },
};

export const WithBlocks: Story = {
  args: {
    content: JSON.stringify({
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: 'This is a <b>block</b> content with <i>formatting</i>.',
          },
        },
        {
          type: 'header',
          data: { text: 'Header Block', level: 2 },
        },
      ],
    }),
  },
};

export const Empty: Story = {
  args: {
    content: '',
  },
};

export const InvalidContent: Story = {
  args: {
    content: '{invalid: true,}',
  },
};
