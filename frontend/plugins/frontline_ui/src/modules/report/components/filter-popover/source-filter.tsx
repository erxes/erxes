import { Command } from 'erxes-ui';
import { BackButton } from './back-button';
import { SOURCE_OPTIONS } from '@/report/constants/data';

export const SourceFilter = ({
  setView,
}: {
  setView: (view: string) => void;
}) => {
  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      <BackButton onSelect={() => setView('root')} />
      {SOURCE_OPTIONS.map((option) => (
        <Command.Item
          key={option.value}
          value={option.value}
          onSelect={() => {}}
        >
          {option.label}
        </Command.Item>
      ))}
    </Command.List>
  );
};
