import { useTemplatesGalleryFilters } from '@/template/hooks/useTemplatesGalleryFilters';
import { Button } from 'erxes-ui';

export const TemplatesGalleryFilters = () => {
  const { groupOptions, selectGroup } = useTemplatesGalleryFilters();

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-5 pt-4">
      {groupOptions.map(({ value, label, icon: Icon, isActive }) => (
        <Button
          key={value || 'all'}
          size="sm"
          variant={isActive ? 'secondary' : 'ghost'}
          className={isActive ? 'text-foreground' : 'text-muted-foreground'}
          onClick={() => selectGroup(value)}
        >
          <Icon className="size-4" />
          {label}
        </Button>
      ))}
    </div>
  );
};
