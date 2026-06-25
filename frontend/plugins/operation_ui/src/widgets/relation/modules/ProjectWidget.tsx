import { IconClipboard } from '@tabler/icons-react';
import { ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ProjectWidget = ({
  contentId,
  contentType,
  customerIds,
  companyIds,
}: {
  contentId: string;
  contentType: string;
  customerIds?: string[];
  companyIds?: string[];
}) => {
  const { t } = useTranslation('operation');
  return (
    <ScrollArea className="h-full flex-auto">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2 items-center justify-center">
          <IconClipboard className="size-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {t('no-projects-related')}
          </span>
        </div>
      </div>
    </ScrollArea>
  );
};
