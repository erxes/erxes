import { Button, useMultiQueryState } from 'erxes-ui';
import { IconBrandTrello, IconSettings } from '@tabler/icons-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export const NoStagesWarning = () => {
  const { t } = useTranslation('sales');
  const [{ boardId, pipelineId }] = useMultiQueryState<{
    boardId: string;
    pipelineId: string;
  }>(['boardId', 'pipelineId']);
  const settingsSearchParams = new URLSearchParams();
  if (boardId) settingsSearchParams.set('activeBoardId', boardId);
  if (pipelineId) settingsSearchParams.set('pipelineId', pipelineId);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center text-center p-6 gap-2">
      <IconBrandTrello
        size={64}
        stroke={1.5}
        className="text-muted-foreground"
      />
      <h2 className="text-lg font-semibold text-muted-foreground">
        {t('no-stages-yet')}
      </h2>
      <p className="text-md text-muted-foreground mb-4">
        {t('create-stage-to-your-board')}
      </p>
      <Button variant="outline" asChild>
        <Link to={`/settings/sales/deals?${settingsSearchParams.toString()}`}>
          <IconSettings />
          {t('go-to-settings')}
        </Link>
      </Button>
    </div>
  );
};
