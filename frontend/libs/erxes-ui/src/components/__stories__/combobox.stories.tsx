/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from '@storybook/react';
import { Combobox } from 'erxes-ui/components/combobox';
import { Popover } from 'erxes-ui/components/popover';
import { Command } from 'erxes-ui/components/command';
import { useState } from 'react';

const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox.Trigger,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Combobox>;

const frameworks = [
  { value: 'next.js', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
];

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');

    return (
      <div className="w-[300px]">
        <Popover open={open} onOpenChange={setOpen}>
          <Combobox.Trigger>
            <Combobox.Value value={value} placeholder="Select framework..." />
          </Combobox.Trigger>
          <Combobox.Content>
            <Command>
              <Command.Input placeholder="Search framework..." />
              <Command.Empty>No framework found.</Command.Empty>
              <Command.List>
                {frameworks.map((framework) => (
                  <Command.Item
                    key={framework.value}
                    value={framework.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? '' : currentValue);
                      setOpen(false);
                    }}
                  >
                    {framework.label}
                    <Combobox.Check checked={value === framework.value} />
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </Combobox.Content>
        </Popover>
      </div>
    );
  },
};

export const WithLoading: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="w-[300px]">
        <Popover open={open} onOpenChange={setOpen}>
          <Combobox.Trigger>
            <Combobox.Value placeholder="Select framework..." />
          </Combobox.Trigger>
          <Combobox.Content>
            <Command>
              <Command.Input placeholder="Search framework..." />
              <Command.List>
                <Combobox.Empty loading={true} />
              </Command.List>
            </Command>
          </Combobox.Content>
        </Popover>
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="w-[300px]">
        <Popover open={open} onOpenChange={setOpen}>
          <Combobox.Trigger>
            <Combobox.Value placeholder="Select framework..." />
          </Combobox.Trigger>
          <Combobox.Content>
            <Command>
              <Command.Input placeholder="Search framework..." />
              <Command.List>
                <Combobox.Empty
                  error={{ message: 'Failed to load frameworks' } as any}
                />
              </Command.List>
            </Command>
          </Combobox.Content>
        </Popover>
      </div>
    );
  },
};

export const WithFetchMore: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');

    return (
      <div className="w-[300px]">
        <Popover open={open} onOpenChange={setOpen}>
          <Combobox.Trigger>
            <Combobox.Value value={value} placeholder="Select framework..." />
          </Combobox.Trigger>
          <Combobox.Content>
            <Command>
              <Command.Input placeholder="Search framework..." />

              <Command.List>
                <Command.Empty>No framework found.</Command.Empty>
                {frameworks.map((framework) => (
                  <Command.Item
                    key={framework.value}
                    value={framework.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? '' : currentValue);
                      setOpen(false);
                    }}
                  >
                    {framework.label}
                    <Combobox.Check checked={value === framework.value} />
                  </Command.Item>
                ))}
                <Combobox.FetchMore
                  currentLength={5}
                  totalCount={10}
                  fetchMore={() => console.log('Fetching more...')}
                />
              </Command.List>
            </Command>
          </Combobox.Content>
        </Popover>
      </div>
    );
  },
};
