import { AutomationFolderCard } from '@/automations/components/list/folders/AutomationFolderCard';
import { IAutomationFolder } from '@/automations/types';
import { useTranslation } from 'react-i18next';

/** The folders at the top of the automations list. */
export const AutomationFolderCards = ({
  folders,
  onOpen,
}: {
  folders: IAutomationFolder[];
  onOpen: (folderId: string) => void;
}) => {
  const { t } = useTranslation('automations');

  if (!folders.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2 px-3 pt-3">
      <h2 className="text-xs font-medium text-muted-foreground uppercase">
        {t('folders')}
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {folders.map((folder) => (
          <AutomationFolderCard
            key={folder._id}
            folder={folder}
            onOpen={() => onOpen(folder._id)}
          />
        ))}
      </div>
    </section>
  );
};
