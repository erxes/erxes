import { useState, useEffect } from 'react';
import { Button, toast } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '../../hooks/usePosDetail';
import mutations from '../../graphql/mutations';
import { AddConfigSheet, CardConfig } from './AddConfigSheet';

interface SyncListProps {
  posId?: string;
}

export const SyncList: React.FC<SyncListProps> = ({ posId }) => {
  const [configs, setConfigs] = useState<CardConfig[]>([]);
  const [editingConfig, setEditingConfig] = useState<CardConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (posDetail?.cardsConfig) {
      const cardsConfig = posDetail.cardsConfig;
      const configList: CardConfig[] = Object.entries(cardsConfig).map(
        ([key, value]: [string, any]) => ({
          _id: key,
          branchId: value.branchId || '',
          boardId: value.boardId || '',
          pipelineId: value.pipelineId || '',
          stageId: value.stageId || '',
          assignedUserIds: value.assignedUserIds || [],
          deliveryMapField: value.deliveryMapField || '',
          title: value.title || key,
        }),
      );
      setConfigs(configList);
    }
  }, [posDetail]);

  const handleConfigAdded = (config: CardConfig) => {
    setConfigs((prev) => [...prev, config]);
    setHasChanges(true);
  };

  const handleConfigUpdated = (config: CardConfig) => {
    setConfigs((prev) => prev.map((c) => (c._id === config._id ? config : c)));
    setHasChanges(true);
  };

  const handleDelete = (configId: string) => {
    setConfigs((prev) => prev.filter((c) => c._id !== configId));
    setHasChanges(true);
  };

  const handleEdit = (config: CardConfig) => {
    setEditingConfig(config);
  };

  const handleSaveChanges = async () => {
    if (!posId) {
      toast({
        title: 'Error',
        description: 'POS ID is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const cardsConfig: Record<string, any> = {};
      configs.forEach((config) => {
        const key =
          config._id || config.branchId || `config_${configs.indexOf(config)}`;
        cardsConfig[key] = {
          branchId: config.branchId,
          boardId: config.boardId,
          pipelineId: config.pipelineId,
          stageId: config.stageId,
          assignedUserIds: config.assignedUserIds,
          deliveryMapField: config.deliveryMapField,
          title: config.title,
        };
      });

      await posEdit({
        variables: {
          _id: posId,
          cardsConfig,
        },
      });

      toast({
        title: 'Success',
        description: 'Cards config saved successfully',
      });

      setHasChanges(false);
    } catch (err) {
      console.error('Error saving cards config:', err);
      toast({
        title: 'Error',
        description: 'Failed to save cards config',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddConfigSheet
          onConfigAdded={handleConfigAdded}
          onConfigUpdated={handleConfigUpdated}
          editingConfig={editingConfig}
          onEditComplete={() => setEditingConfig(null)}
        />
      </div>

      {configs.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No configurations yet. Click "Add Config" to add one.
        </div>
      ) : (
        <div className="space-y-2">
          {configs.map((config) => (
            <div
              key={config._id}
              className="flex justify-between items-center p-4 rounded-lg border"
            >
              <div>
                <div className="font-medium">{config.title || 'Untitled'}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(config)}
                >
                  <IconEdit size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => config._id && handleDelete(config._id)}
                  className="text-destructive"
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasChanges && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSaveChanges} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};
