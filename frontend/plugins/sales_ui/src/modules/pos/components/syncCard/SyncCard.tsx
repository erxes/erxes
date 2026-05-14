import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Form, InfoCard, Label, toast } from 'erxes-ui';
import { useForm, useFieldArray } from 'react-hook-form';
import { SyncList } from '@/pos/components/syncCard/SyncList';
import mutations from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import type { CardConfig } from './AddConfigSheet';

interface SyncCardProps {
  posId?: string;
  posType?: string;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

export interface SyncCardFormData {
  configs: CardConfig[];
}

const SYNC_CARD_FORM_ID = 'pos-sync-card-form';

const DEFAULT_FORM_VALUES: SyncCardFormData = {
  configs: [],
};

const SyncCard: React.FC<SyncCardProps> = ({
  posId,
  posType,
  onSaveActionChange,
}) => {
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const [editingConfig, setEditingConfig] = useState<CardConfig | null>(null);

  const form = useForm<SyncCardFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const { control, handleSubmit, reset, formState } = form;
  const { isDirty } = formState;

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'configs',
  });

  useEffect(() => {
    if (!posDetail?.cardsConfig) {
      return;
    }

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

    reset({ configs: configList });
  }, [posDetail, reset]);

  const handleSaveChanges = useCallback(
    async (data: SyncCardFormData) => {
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
        data.configs.forEach((config) => {
          const key =
            config.title ||
            config._id ||
            `config_${data.configs.indexOf(config)}`;
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
        reset(data);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to save cards config',
          variant: 'destructive',
        });
      }
    },
    [posEdit, posId, reset],
  );

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      isDirty ? (
        <Button
          type="submit"
          form={SYNC_CARD_FORM_ID}
          size="sm"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [isDirty, onSaveActionChange, saving]);

  const handleConfigAdded = (config: CardConfig) => {
    append(config);
  };

  const handleConfigUpdated = (config: CardConfig) => {
    const index = fields.findIndex((f) => (f as CardConfig)._id === config._id);
    if (index >= 0) {
      update(index, config);
    }
  };

  const handleDelete = (index: number) => {
    remove(index);
  };

  const handleEdit = (config: CardConfig) => {
    setEditingConfig(config);
  };

  const renderContent = () => {
    if (detailLoading) {
      return (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 rounded animate-pulse bg-muted" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 text-center">
          <p className="text-destructive">
            Failed to load POS details: {error.message}
          </p>
        </div>
      );
    }

    return (
      <Form {...form}>
        <form
          id={SYNC_CARD_FORM_ID}
          onSubmit={handleSubmit(handleSaveChanges)}
          className="space-y-8"
        >
          <section className="space-y-4">
            <Label>Sync Cards</Label>
            <SyncList
              fields={fields}
              onConfigAdded={handleConfigAdded}
              onConfigUpdated={handleConfigUpdated}
              onDelete={handleDelete}
              onEdit={handleEdit}
              editingConfig={editingConfig}
              onEditComplete={() => setEditingConfig(null)}
            />
          </section>
        </form>
      </Form>
    );
  };

  return (
    <div className="p-6">
      <InfoCard title="Sync configuration">
        <InfoCard.Content>{renderContent()}</InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export default SyncCard;
