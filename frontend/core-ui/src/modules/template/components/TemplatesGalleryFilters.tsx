import { useTemplatesGallery } from '@/template/hooks/useTemplatesGallery';
import { Button, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const ALL_PLUGINS = '__all';

export const TemplatesGalleryFilters = () => {
  const { t } = useTranslation('templates');
  const { group, plugin, groups, plugins, setGroup, setPlugin } =
    useTemplatesGallery();

  return (
    <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
      <Button
        size="sm"
        variant={group ? 'ghost' : 'secondary'}
        onClick={() => setGroup()}
      >
        {t('group-all')}
      </Button>
      {groups.map((value) => (
        <Button
          key={value}
          size="sm"
          variant={group === value ? 'secondary' : 'ghost'}
          onClick={() => setGroup(value)}
        >
          {t(`group-${value}`)}
        </Button>
      ))}
      {plugins.length > 1 && (
        <Select
          value={plugin || ALL_PLUGINS}
          onValueChange={(value) =>
            setPlugin(value === ALL_PLUGINS ? undefined : value)
          }
        >
          <Select.Trigger className="ml-auto h-8 w-44">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={ALL_PLUGINS}>{t('plugin-all')}</Select.Item>
            {plugins.map((name) => (
              <Select.Item key={name} value={name} className="capitalize">
                {name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      )}
    </div>
  );
};
