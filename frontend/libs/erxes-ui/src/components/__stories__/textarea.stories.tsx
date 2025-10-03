import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from 'erxes-ui/components/textarea';
import { Label } from 'erxes-ui/components/label';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'When true, the textarea is disabled',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the textarea',
    },
    rows: {
      control: 'number',
      description: 'Number of visible text lines',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: 'Type your message here.',
    className: 'w-[300px]',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-1.5 max-w-sm">
      <Label htmlFor="message">Your message</Label>
      <Textarea id="message" placeholder="Type your message here." />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Textarea
      disabled
      placeholder="This textarea is disabled."
      className="w-[300px]"
    />
  ),
};

export const WithRows: Story = {
  render: () => (
    <Textarea
      rows={10}
      placeholder="This textarea has 10 rows."
      className="w-[300px]"
    />
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <Textarea
      defaultValue="This is some default text in the textarea that was pre-populated."
      className="w-[300px]"
    />
  ),
};
