import type { Meta, StoryObj } from '@storybook/react';
import { IconBold, IconItalic, IconUnderline } from '@tabler/icons-react';
import { ToggleGroup } from 'erxes-ui';

const meta: Meta = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      options: ['xs', 'sm', 'default', 'lg'],
      description: 'Size of the ToggleGroup',
      defaultValue: 'default',
      control: 'select',
    },
    variant: {
      options: ['default', 'outline'],
      description: 'Variant of the ToggleGroup',
      defaultValue: 'default',
      control: 'select',
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: (args) => (
    <ToggleGroup type="multiple">
      <ToggleGroup.Item value="bold" aria-label="Toggle bold" {...args}>
        <IconBold className="h-4 w-4" />
      </ToggleGroup.Item>
      <ToggleGroup.Item value="italic" aria-label="Toggle italic" {...args}>
        <IconItalic className="h-4 w-4" />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="strikethrough"
        aria-label="Toggle strikethrough"
        {...args}
      >
        <IconUnderline className="h-4 w-4" />
      </ToggleGroup.Item>
    </ToggleGroup>
  ),
};
