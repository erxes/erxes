import { Command } from 'erxes-ui';
import { IconChevronLeft } from '@tabler/icons-react';

interface BackButtonProps {
  onSelect: () => void;
}

export const BackButton = ({ onSelect }: BackButtonProps) => {
  return (
    <Command.Item value="back" onSelect={onSelect} className="text-sm">
      <IconChevronLeft className="w-3 h-3" />
      Back
    </Command.Item>
  );
};
