import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { CardConfig } from '@/pos/components/syncCard/cardConfig';

interface SyncListProps {
  configs: CardConfig[];
  deleting: boolean;
  onAdd: () => void;
  onEdit: (config: CardConfig) => void;
  onDelete: (config: CardConfig) => void;
}

export const SyncList: React.FC<SyncListProps> = ({
  configs,
  deleting,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation('sales');

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={onAdd}>
          <IconPlus />
          {t('add-config')}
        </Button>
      </div>

      {configs.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          {t('no-configs-yet')}
        </div>
      ) : (
        <div className="space-y-2">
          {configs.map((config) => (
            <div
              key={config._id}
              className="flex justify-between items-center p-4 rounded-lg border"
            >
              <div className="font-medium">{config.title || t('untitled')}</div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t('edit')}
                  onClick={() => onEdit(config)}
                >
                  <IconEdit size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t('delete')}
                  disabled={deleting}
                  onClick={() => onDelete(config)}
                  className="text-destructive"
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
