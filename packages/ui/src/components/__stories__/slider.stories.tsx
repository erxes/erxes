import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Slider } from 'erxes-ui/components/slider';

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    hideThumb: {
      control: 'boolean',
      defaultValue: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: (args) => (
    <div className="w-full min-w-64 max-w-sm space-y-4">
      <Slider defaultValue={[50]} max={100} step={1} {...args} />
    </div>
  ),
};

export const Range: Story = {
  render: () => (
    <div className="w-full min-w-64 max-w-sm space-y-4">
      <Slider defaultValue={[20, 80]} max={100} step={1} />
    </div>
  ),
};

export const WithValue: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState([33]);
    return (
      <div className="w-full min-w-64 max-w-sm space-y-4">
        <Slider value={value} onValueChange={setValue} max={100} step={1} />
        <div className="text-center font-medium">Value: {value}</div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-full min-w-64 max-w-sm space-y-4">
      <Slider defaultValue={[50]} max={100} step={1} disabled />
    </div>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <div className="w-full min-w-64 max-w-sm space-y-2">
      <div className="flex justify-between">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  ),
};
