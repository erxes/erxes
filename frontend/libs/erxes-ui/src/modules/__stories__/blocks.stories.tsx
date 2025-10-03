import { Meta, StoryObj } from '@storybook/react';
import { Editor, BlockEditorReadOnly } from 'erxes-ui/modules';
import { useState } from 'react';

const meta: Meta<typeof Editor> = {
  title: 'Modules/Blocks',
  component: Editor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Editor>;

export const Default: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [content, setContent] = useState('');

    return (
      <div className=" ">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Block Editor</h3>
          <Editor
            onChange={setContent}
            scope="block-editor"
            className="min-h-[200px] w-[600px]"
          />
        </div>

        {content && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Preview (Read Only)</h3>
            <div className="p-4 border border-border rounded-md">
              <BlockEditorReadOnly content={content} />
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const ReadOnly: Story = {
  render: () => {
    const sampleContent = JSON.stringify([
      {
        id: '1',
        type: 'paragraph',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: [
          {
            type: 'text',
            text: 'This is a read-only block editor view.',
            styles: {},
          },
        ],
        children: [],
      },
      {
        id: '2',
        type: 'heading',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
          level: 2,
        },
        content: [
          {
            type: 'text',
            text: 'Sample Heading',
            styles: {
              bold: true,
            },
          },
        ],
        children: [],
      },
      {
        id: '3',
        type: 'bulletListItem',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: [
          {
            type: 'text',
            text: 'List item one',
            styles: {},
          },
        ],
        children: [],
      },
      {
        id: '4',
        type: 'bulletListItem',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: [
          {
            type: 'text',
            text: 'List item two',
            styles: {},
          },
        ],
        children: [],
      },
    ]);

    return (
      <div className="w-full max-w-3xl space-y-4">
        <h3 className="text-lg font-medium">Read Only Block Editor</h3>
        <div className="p-4 border border-border rounded-md">
          <BlockEditorReadOnly content={sampleContent} />
        </div>
      </div>
    );
  },
};
