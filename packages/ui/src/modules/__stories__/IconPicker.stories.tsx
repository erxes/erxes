import { IconsProvider } from 'erxes-ui/modules/icons';
import { IconPicker } from '../icons/components/IconPicker';

export const IconPickerStory = () => {
  return (
    <IconsProvider>
      <IconPicker />
    </IconsProvider>
  );
};

export default {
  title: 'Modules/IconPicker',
  component: IconPickerStory,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};
