import { Checkbox, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const FilesSelectCheckbox = ({
  checked,
  visible,
  onToggle,
  className,
}: {
  checked: boolean;
  visible: boolean;
  onToggle: (range: boolean) => void;
  className?: string;
}) => {
  const { t } = useTranslation('files');

  return (
    <Checkbox
      checked={checked}
      aria-label={t('select')}
      className={cn(
        'bg-background shadow-sm transition-opacity',
        visible || checked
          ? 'opacity-100'
          : 'opacity-0 group-hover:opacity-100',
        className,
      )}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onToggle(e.shiftKey);
      }}
    />
  );
};
