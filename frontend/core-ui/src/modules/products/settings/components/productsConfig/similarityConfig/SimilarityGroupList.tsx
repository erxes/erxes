import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InfoCard, ScrollArea, Skeleton } from 'erxes-ui';
import {
  ProductEditorPanel,
  ProductEditorHeader,
} from '@/products/components/ProductEditorPanel';
import { Can } from 'ui-modules';
import { SimilarityGroupItem } from './SimilarityGroupItem';
import { ISimilarityGroupConfig, ISimilarityGroupMap } from './types';
import { IconStack2 } from '@tabler/icons-react';

interface SimilarityGroupListProps {
  groupsMap: ISimilarityGroupMap;
  configsLoading: boolean;
  newlyAddedKey?: string | null;
  onSave: (
    oldGroupKey: string,
    newGroupKey: string,
    config: ISimilarityGroupConfig,
  ) => Promise<void>;
  onDelete: (codeGroupKey: string) => Promise<void>;
}

export const SimilarityGroupList = ({
  groupsMap,
  configsLoading,
  newlyAddedKey,
  onSave,
  onDelete,
}: SimilarityGroupListProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'similarity-config' });
  const [selected, setSelected] = useState<{
    key: string;
    config: ISimilarityGroupConfig;
  } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (newlyAddedKey && groupsMap[newlyAddedKey]) {
      setSelected({ key: newlyAddedKey, config: groupsMap[newlyAddedKey] });
      setOpen(true);
    }
    // A new draft is selected once, when its key is first assigned.
  }, [newlyAddedKey]);

  useEffect(() => {
    if (selected && !groupsMap[selected.key] && !configsLoading) {
      setOpen(false);
    }
  }, [groupsMap, selected, configsLoading]);

  const entries = Object.entries(groupsMap);
  const renderList = () => {
    if (configsLoading) {
      return (
        <InfoCard
          title={t('similarity-groups', 'Similarity Groups')}
          className="h-full"
        >
          <InfoCard.Content className="space-y-0">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
          </InfoCard.Content>
        </InfoCard>
      );
    }
    if (!entries.length) {
      return <EmptyStateRow />;
    }
    return (
      <InfoCard
        title={t('similarity-groups', 'Similarity Groups')}
        className="h-full min-h-0"
      >
        <InfoCard.Content className="overflow-y-auto flex-1 min-h-0">
          {entries.map(([key, config]) => (
            <div key={key} className="border-b">
              <Can action="productsConfigsManage">
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start px-4 py-3"
                  onClick={() => {
                    setSelected({ key, config });
                    setOpen(true);
                  }}
                >
                  {config.title ||
                    t('new-similarity-group', 'New similarity group')}
                </Button>
              </Can>
            </div>
          ))}
        </InfoCard.Content>
      </InfoCard>
    );
  };

  return (
    <>
      {renderList()}
      <ProductEditorPanel
        name={`similarity-groups/${selected?.key || 'detail'}`}
        open={open}
        onOpenChange={setOpen}
        requiredPermission="productsConfigsManage"
      >
        <ProductEditorHeader
          title={
            selected?.config.title ||
            t('new-similarity-group', 'New similarity group')
          }
        />
        <ScrollArea className="min-h-0 flex-1">
          {selected && (
            <SimilarityGroupItem
              key={selected.key}
              codeGroupKey={selected.key}
              config={selected.config}
              onSave={onSave}
              onDelete={onDelete}
            />
          )}
        </ScrollArea>
      </ProductEditorPanel>
    </>
  );
};

function EmptyStateRow() {
  const { t } = useTranslation('product', { keyPrefix: 'similarity-config' });
  return (
    <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
      <IconStack2 size={64} stroke={1.5} className="text-muted-foreground" />
      <h2 className="text-lg font-semibold text-muted-foreground">
        {t('no-similarity-groups', 'No similarity groups yet')}
      </h2>
      <p className="mb-4 text-md text-muted-foreground">
        {t(
          'empty-similarity-hint',
          'Get started by creating your first similarity group config.',
        )}
      </p>
    </div>
  );
}
