import type { Meta, StoryObj } from '@storybook/react';
import { Select } from 'erxes-ui/components/select';
import { Label } from 'erxes-ui/components/label';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <Select.Trigger className="w-[200px]">
        <Select.Value placeholder="Select a fruit" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana">Banana</Select.Item>
        <Select.Item value="orange">Orange</Select.Item>
        <Select.Item value="grape">Grape</Select.Item>
        <Select.Item value="pineapple">Pineapple</Select.Item>
      </Select.Content>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="fruit">Favorite Fruit</Label>
      <Select>
        <Select.Trigger className="w-[200px]" id="fruit">
          <Select.Value placeholder="Select a fruit" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="banana">Banana</Select.Item>
          <Select.Item value="orange">Orange</Select.Item>
        </Select.Content>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <Select.Trigger className="w-[200px]">
        <Select.Value placeholder="Disabled" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="option1">Option 1</Select.Item>
        <Select.Item value="option2">Option 2</Select.Item>
      </Select.Content>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <Select.Trigger className="w-[200px]">
        <Select.Value placeholder="Select an option" />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          <Select.Label>Fruits</Select.Label>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="banana">Banana</Select.Item>
          <Select.Item value="orange">Orange</Select.Item>
        </Select.Group>
        <Select.Separator />
        <Select.Group>
          <Select.Label>Vegetables</Select.Label>
          <Select.Item value="carrot">Carrot</Select.Item>
          <Select.Item value="broccoli">Broccoli</Select.Item>
          <Select.Item value="spinach">Spinach</Select.Item>
        </Select.Group>
      </Select.Content>
    </Select>
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <Select>
      <Select.Trigger className="w-[200px]">
        <Select.Value placeholder="Select an option" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="option1">Available option</Select.Item>
        <Select.Item value="option2" disabled>
          Disabled option
        </Select.Item>
        <Select.Item value="option3">Another option</Select.Item>
      </Select.Content>
    </Select>
  ),
};
