import { getProjectDetailPath } from '@/project/utils/getProjectDetailPath';
import { IProjectDetail } from '@/project/types';
import { IconChecklist, IconLink } from '@tabler/icons-react';
import { Button, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

export const ProjectPanelActions = ({
  project,
}: {
  project: IProjectDetail;
}) => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const { pathname } = useLocation();
  const detailPath = getProjectDetailPath(
    project._id,
    pathname,
    project.teamIds,
  );
  const copyUrl = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${detailPath}`,
      );
      toast({
        title: t('copied'),
        description: t('copied-to-clipboard', { label: 'URL' }),
      });
    } catch {
      toast({
        title: t('error'),
        description: t('failed-to-copy'),
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        title={t('tasks')}
        aria-label={t('tasks')}
        asChild
      >
        <Link to={detailPath.replace(/\/overview$/, '/tasks')}>
          <IconChecklist className="size-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        title={t('copy-url', 'Copy URL')}
        aria-label={t('copy-url', 'Copy URL')}
        onClick={copyUrl}
      >
        <IconLink className="size-4" />
      </Button>
    </>
  );
};
