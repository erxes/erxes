import { useState, useEffect } from 'react';
import { InfoCard, Skeleton } from 'erxes-ui';
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
  const [openKey, setOpenKey] = useState<string | null>(null);

  useEffect(() => {
    if (newlyAddedKey) {
      setOpenKey(newlyAddedKey);
    }
  }, [newlyAddedKey]);

  if (configsLoading) {
    return (
      <InfoCard title="Similarity Groups" className="h-full">
        <InfoCard.Content className="space-y-0">
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
        </InfoCard.Content>
      </InfoCard>
    );
  }

  const entries = Object.entries(groupsMap);

  return (
    <>
      {entries.length === 0 ? (
        <EmptyStateRow />
      ) : (
        <InfoCard title="Similarity Groups" className="h-full">
          <InfoCard.Content className="overflow-y-auto flex-1">
            {entries.map(([codeGroupKey, config]) => (
              <SimilarityGroupItem
                key={codeGroupKey}
                codeGroupKey={codeGroupKey}
                config={config}
                isOpen={openKey === codeGroupKey}
                onToggle={() =>
                  setOpenKey((prev) =>
                    prev === codeGroupKey ? null : codeGroupKey,
                  )
                }
                onSave={onSave}
                onDelete={onDelete}
              />
            ))}
          </InfoCard.Content>
        </InfoCard>
      )}
    </>
  );
};

function EmptyStateRow() {
  return (
    <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
      <IconStack2 size={64} stroke={1.5} className="text-muted-foreground" />
      <h2 className="text-lg font-semibold text-muted-foreground">
        No similarity groups yet
      </h2>
      <p className="mb-4 text-md text-muted-foreground">
        Get started by creating your first similarity group config.
      </p>
    </div>
  );
}
