import { IconRefresh } from '@tabler/icons-react';
import { PosItemList } from '@/pos/components/pos-edit/PosItemList';
import { PosSettingsSection } from '@/pos/components/pos-edit/PosSettingsSection';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';
import {
  type CardConfigDraft,
  toCardConfigs,
  toCardsConfigInput,
} from '@/pos/components/syncCard/cardConfig';
import { POS_CARD_CONFIG_CONTENT_TYPE } from '@/pos/constants/posPanel';
import { mutations } from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { useMutation } from '@apollo/client';
import { toast, useConfirm } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';

interface SyncCardProps {
  posId?: string;
}

const SyncCard: React.FC<SyncCardProps> = ({ posId }) => {
  const { t } = useTranslation('sales');
  const labels = usePosSettingsLabels();
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
    openNewRecord(POS_CARD_CONFIG_CONTENT_TYPE, { ...draft }, { stack: true });
  };

  const handleDelete = (configId: string) => {
    if (!posId) return;

    confirm({
      message: t('confirm-remove-selected'),
    }).then(async () => {
      try {
        await posEdit({
          variables: {
            _id: posId,
            cardsConfig: toCardsConfigInput(
              configs.filter(({ _id }) => _id !== configId),
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
      <PosSettingsSection
        title={t('sync-cards')}
        description={labels.syncCardsDescription}
      >
        <PosItemList
          items={configs.map((config) => ({
            id: config._id,
            title: config.title || t('untitled'),
          }))}
          emptyIcon={IconRefresh}
          emptyText={t('no-configs-yet')}
          addLabel={t('add-config')}
          addDisabled={!posId}
          deleting={deleting}
          onAdd={() => openConfig()}
          onEdit={openConfig}
          onDelete={handleDelete}
        />
      </PosSettingsSection>
    );
  };

  return <>{renderContent()}</>;
};

export { SyncCard };
