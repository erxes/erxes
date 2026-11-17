import { isGithubTriage } from '@/operation/utils/isGithubTriage';
import { ConvertToTask } from '@/triage/components/triage-selects/ConvertToTask';
import { DeclineTriage } from '@/triage/components/triage-selects/DeclineTriage';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { IconBrandGithub } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

// A triage's actions in the side panel's top bar: the GitHub issue it was
// created from, if any, then Decline / Accept. Accepting (or declining)
// turns it into a task, which keeps its customers and companies and opens
// in its place.
export const TriagePanelActions = ({ triageId }: { triageId: string }) => {
  const { t } = useTranslation('operation');
  const { triage } = useGetTriage(triageId);

  return (
    <>
      {triage && isGithubTriage(triage) && (
        <Button asChild variant="ghost" size="icon" className="size-7">
          <a
            href={triage.githubIssueUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`${t('created-from-github-issue', {
              defaultValue: 'Created from GitHub issue',
            })} ${triage.githubRepoName ? `${triage.githubRepoName} ` : ''}#${
              triage.githubIssueNumber
            }`}
          >
            <IconBrandGithub className="size-4" />
          </a>
        </Button>
      )}
      <DeclineTriage triageId={triageId} size="sm" />
      <ConvertToTask triageId={triageId} size="sm" />
    </>
  );
};
