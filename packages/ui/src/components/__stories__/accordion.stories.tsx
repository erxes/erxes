import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from 'erxes-ui/components/accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md min-w-96">
      <Accordion.Item value="item-1">
        <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
        <Accordion.Content>
          Yes. It adheres to the WAI-ARIA design pattern.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Trigger>Is it styled?</Accordion.Trigger>
        <Accordion.Content>
          Yes. It comes with default styles that match the other
          components&apos; aesthetic.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Trigger>Is it animated?</Accordion.Trigger>
        <Accordion.Content>
          Yes. It&apos;s animated by default, but you can disable it if you
          prefer.
      </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full max-w-md min-w-96">
      <Accordion.Item value="item-1">
        <Accordion.Trigger>Can I open multiple items?</Accordion.Trigger>
        <Accordion.Content>
          Yes. You can open multiple items at the same time by setting the type
          prop to &quot;multiple&quot;.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Trigger>How does it work?</Accordion.Trigger>
        <Accordion.Content>
          The accordion uses Radix UI&apos;s Accordion primitive under the hood,
          styled with Tailwind CSS.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Trigger>Can it be customized?</Accordion.Trigger>
        <Accordion.Content>
          Yes. You can customize the appearance by passing className props to
          the components or by modifying the component in your project.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};
