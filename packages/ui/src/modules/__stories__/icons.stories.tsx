import { ALL_ICONS } from 'erxes-ui/modules/icons/components/TablerIcons';
import { IconsProvider } from '../icons';
import { IconComponent } from '../icons/components/IconComponent';
import { StoryObj } from '@storybook/react';

export const IconStory = ({ name }: { name?: keyof typeof ALL_ICONS }) => (
  <IconsProvider>
    <IconComponent name={name} />
  </IconsProvider>
);

export default {
  title: 'Modules/Icons',
  component: IconStory,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

type Story = StoryObj<typeof IconStory>;

export const Default: Story = {};

export const WithCustomIcon: Story = {
  args: {
    name: 'IconAlertCircle',
  },
};
