import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MultipleSelector, MultiSelectOption } from 'erxes-ui/components';

const meta: Meta<typeof MultipleSelector> = {
  title: 'Components/MultipleSelector',
  component: MultipleSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MultipleSelector>;

const options: MultiSelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
  { value: 'grape', label: 'Grape' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'watermelon', label: 'Watermelon' },
  { value: 'kiwi', label: 'Kiwi' },
  { value: 'mango', label: 'Mango' },
  { value: 'pineapple', label: 'Pineapple' },
  { value: 'peach', label: 'Peach' },
];

const groupedOptions: MultiSelectOption[] = [
  { value: 'apple', label: 'Apple', group: 'fruits' },
  { value: 'banana', label: 'Banana', group: 'fruits' },
  { value: 'orange', label: 'Orange', group: 'fruits' },
  { value: 'carrot', label: 'Carrot', group: 'vegetables' },
  { value: 'broccoli', label: 'Broccoli', group: 'vegetables' },
  { value: 'cucumber', label: 'Cucumber', group: 'vegetables' },
  { value: 'beef', label: 'Beef', group: 'meat' },
  { value: 'chicken', label: 'Chicken', group: 'meat' },
  { value: 'pork', label: 'Pork', group: 'meat' },
];

export const Default: Story = {
  render: () => {
    return (
      <div className="w-[400px]">
        <MultipleSelector
          placeholder="Select fruits..."
          defaultOptions={options}
          onChange={(values: MultiSelectOption[]) => console.log(values)}
        />
      </div>
    );
  },
};

export const WithDefaultValue: Story = {
  render: () => {
    return (
      <div className="w-[400px]">
        <MultipleSelector
          placeholder="Select fruits..."
          defaultOptions={options}
          value={[options[0], options[2]]}
          onChange={(values: MultiSelectOption[]) => console.log(values)}
        />
      </div>
    );
  },
};

export const WithFixedOptions: Story = {
  render: () => {
    return (
      <div className="w-[400px]">
        <MultipleSelector
          placeholder="Select fruits..."
          defaultOptions={[{ ...options[0], fixed: true }, ...options.slice(1)]}
          onChange={(values: MultiSelectOption[]) => console.log(values)}
        />
      </div>
    );
  },
};

export const WithMaxSelected: Story = {
  render: () => {
    return (
      <div className="w-[400px]">
        <MultipleSelector
          placeholder="Select up to 3 fruits..."
          defaultOptions={options}
          maxSelected={3}
          onChange={(values: MultiSelectOption[]) => console.log(values)}
        />
      </div>
    );
  },
};

export const WithGroupedOptions: Story = {
  render: () => {
    return (
      <div className="w-[400px]">
        <MultipleSelector
          placeholder="Select items..."
          defaultOptions={groupedOptions}
          onChange={(values: MultiSelectOption[]) => console.log(values)}
        />
      </div>
    );
  },
};

export const WithSearch: Story = {
  render: () => {
    return (
      <div className="w-[400px]">
        <MultipleSelector
          placeholder="Search and select fruits..."
          defaultOptions={options}
          onSearchSync={(value: string) =>
            options.filter((option) =>
              option.label.toLowerCase().includes(value.toLowerCase()),
            )
          }
          onChange={(values: MultiSelectOption[]) => console.log(values)}
        />
      </div>
    );
  },
};

export const WithAsyncSearch: Story = {
  render: () => {
    return (
      <div className="w-[400px]">
        <MultipleSelector
          placeholder="Search and select fruits..."
          triggerSearchOnFocus={true}
          onSearch={async (value: string) => {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return options.filter((option) =>
              option.label.toLowerCase().includes(value.toLowerCase()),
            );
          }}
          onChange={(values: MultiSelectOption[]) => console.log(values)}
        />
      </div>
    );
  },
};

export const Controlled: Story = {
  render: () => {
    const ControlledExample = () => {
      const [selectedOptions, setSelectedOptions] = useState<
        MultiSelectOption[]
      >([options[0]]);

      return (
        <div className="w-[400px]">
          <MultipleSelector
            placeholder="Controlled select..."
            defaultOptions={options}
            value={selectedOptions}
            onChange={setSelectedOptions}
          />
          <div className="mt-4">
            <p>Selected: {selectedOptions.map((o) => o.label).join(', ')}</p>
          </div>
        </div>
      );
    };

    return <ControlledExample />;
  },
};
