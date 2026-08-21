import { ChecklistItem } from './ChecklistItem';
import { Empty, Separator, Spinner } from 'erxes-ui';
import { IconListCheck } from '@tabler/icons-react';
import { useChecklists } from '@/deals/cards/hooks/useChecklists';
import { useTranslation } from 'react-i18next';

export const Checklists = ({
  stageId,
  dealId,
}: Readonly<{
  stageId?: string;
  dealId?: string;
}>) => {
  const { t } = useTranslation('sales');
  const { checklists, loading, error } = useChecklists({
    variables: { contentTypeId: dealId },
  });

  if (loading && !checklists) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  if (error && !checklists) {
    return (
      <>
        <Empty className="border-0 bg-transparent py-4">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconListCheck />
            </Empty.Media>
            <Empty.Title>
              {t('failed-to-load-checklists', 'Failed to load checklists')}
            </Empty.Title>
            <Empty.Description>{error.message}</Empty.Description>
          </Empty.Header>
        </Empty>
        <Separator className="mt-1" />
      </>
    );
  }

  if (!checklists || checklists.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">{t('checklists', 'Checklists')}</h4>
        <div className="py-2">
          {checklists.map((checklist) => (
            <ChecklistItem
              key={checklist._id}
              item={checklist}
              stageId={stageId}
            />
          ))}
        </div>
      </div>
      <Separator className="mt-1" />
    </>
  );
};
