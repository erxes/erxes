import type { Meta, StoryObj } from '@storybook/react';
import { Resizable } from 'erxes-ui/components/resizable';
import { Button } from 'erxes-ui/components/button';

const meta: Meta<typeof Resizable> = {
  title: 'Components/Resizable',
  component: Resizable.PanelGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Resizable>;

export const Default: Story = {
  render: () => (
    <div className="w-[800px] h-[400px] border rounded-md">
      <Resizable.PanelGroup direction="horizontal">
        <Resizable.Panel className="bg-muted p-4">
          <div className="h-full flex items-center justify-center">
            <p>Left Panel</p>
          </div>
        </Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel className="p-4">
          <div className="h-full flex items-center justify-center">
            <p>Right Panel</p>
          </div>
        </Resizable.Panel>
      </Resizable.PanelGroup>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="w-[400px] h-[400px] border rounded-md">
      <Resizable.PanelGroup direction="vertical">
        <Resizable.Panel className="bg-muted p-4">
          <div className="h-full flex items-center justify-center">
            <p>Top Panel</p>
          </div>
        </Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel className="p-4">
          <div className="h-full flex items-center justify-center">
            <p>Bottom Panel</p>
          </div>
        </Resizable.Panel>
      </Resizable.PanelGroup>
    </div>
  ),
};

export const WithMinMax: Story = {
  render: () => (
    <div className="w-[400px] h-[400px] border rounded-md">
      <Resizable.PanelGroup direction="horizontal">
        <Resizable.Panel className="bg-muted p-4" minSize={20} maxSize={70}>
          <div className="h-full flex items-center justify-center">
            <p>Min: 20%, Max: 70%</p>
          </div>
        </Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel className="p-4">
          <div className="h-full flex items-center justify-center">
            <p>Content Panel</p>
          </div>
        </Resizable.Panel>
      </Resizable.PanelGroup>
    </div>
  ),
};
