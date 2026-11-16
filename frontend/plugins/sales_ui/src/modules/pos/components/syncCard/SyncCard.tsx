import { SyncList } from '@/pos/components/syncCard/SyncList';
import {
  type CardConfig,
  type CardConfigDraft,
  toCardConfigs,
  toCardsConfigInput,
} from '@/pos/components/syncCard/cardConfig';
import { POS_CARD_CONFIG_CONTENT_TYPE } from '@/pos/constants/posPanel';
import { mutations } from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { useMutation } from '@apollo/client';
import { Label, toast, useConfirm } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';

interface SyncCardProps {
  posId?: string;
}

const SyncCard: React.FC<SyncCardProps> = ({ posId }) => {
  const { t } = useTranslation('sales');
  const { posDetail, loading, error } = usePosDetail(posId);
  const [posEdit, { loading: deleting }] = useMutation(mutations.posEdit);
  const { openNewRecord } = useSidePanel();
  const { confirm } = useConfirm();

  const configs = useMemo(
    () => toCardConfigs(posDetail?.cardsConfig),
    [posDetail?.cardsConfig],
  );

  const openConfig = (configKey?: string) => {
    const draft: CardConfigDraft = { posId, configKey };
    openNewRecord(POS_CARD_CONFIG_CONTENT_TYPE, { ...draft });
  };

  const handleDelete = (config: CardConfig) => {
    if (!posId) return;

    confirm({
      message: t('confirm-remove-selected'),
    }).then(async () => {
      try {
        await posEdit({
          variables: {
            _id: posId,
            cardsConfig: toCardsConfigInput(
              configs.filter(({ _id }) => _id !== config._id),
            ),
          },
          refetchQueries: ['salesPosSettingsDetail'],
        });
        toast({ title: t('success'), description: t('cards-config-saved') });
      } catch (e) {
        toast({
          title: t('error'),
          description:
            e instanceof Error ? e.message : t('cards-config-save-failed'),
          variant: 'destructive',
        });
      }
    });
  };

  const renderContent = () => {
    if (loading) {
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
            {t('failed-to-load-pos-details')}: {error.message}
          </p>
        </div>
      );
    }

    return (
      <section className="space-y-4">
        <Label>{t('sync-cards')}</Label>
        <SyncList
          configs={configs}
          deleting={deleting}
          onAdd={() => openConfig()}
          onEdit={(config) => openConfig(config._id)}
          onDelete={handleDelete}
        />
      </section>
    );
  };

  return <>{renderContent()}</>;
};

export { SyncCard };
