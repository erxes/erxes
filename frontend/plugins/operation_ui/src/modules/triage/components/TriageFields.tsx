import type { TriageFieldsProps } from '@/triage/types/triageFields';
import { Input, Separator, BlockEditor, Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ActivityList } from '@/activity/components/ActivityList';
import { SelectPriority } from '@/operation/components/SelectPriority';
import { ConvertToTask } from '@/triage/components/triage-selects/ConvertToTask';
import { DeclineTriage } from '@/triage/components/triage-selects/DeclineTriage';
import { SelectStatus } from '@/operation/components/SelectStatus';
import { IconBrandGithub, IconExternalLink } from '@tabler/icons-react';
import { isGithubTriage } from '@/operation/utils/isGithubTriage';
import { useTriageFieldsEditor } from '@/triage/hooks/useTriageFieldsEditor';
import { TriageConversionDialog } from '@/triage/components/TriageConversionDialog';

export const TriageFields = ({ triage, titleAction }: TriageFieldsProps) => {
  const { t } = useTranslation('operation');
  const {
    _id: triageId,
    priority,
    status,
    githubIssueNumber,
    githubRepoName,
  } = triage;

  const {
    name,
    setName,
    editor,
    isDescriptionReady,
    confirmOpen,
    setConfirmOpen,
    handleDescriptionChange,
    handlePriorityChange,
    handleStatusChange,
    handleConfirmConversion,
  } = useTriageFieldsEditor({
    triage,
    descriptionPlaceholder: t('description-placeholder'),
  });

  return (
    <div className="flex flex-col gap-3">
      {isGithubTriage(triage) && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-fit text-muted-foreground group"
        >
          <a
            href={triage.githubIssueUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBrandGithub className="size-4 shrink-0" />
            <span>
              {t('created-from-github-issue', {
                defaultValue: 'Created from GitHub issue',
              })}
            </span>
            <span className="font-normal">
              {githubRepoName ? `${githubRepoName} ` : ''}#{githubIssueNumber}
            </span>
            <IconExternalLink className="size-3.5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
          </a>
        </Button>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Input
            className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
            placeholder={t('triage-name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {titleAction}
      </div>
      <div className="gap-2 flex flex-wrap w-full">
        <SelectPriority
          variant="detail"
          value={priority}
          onValueChange={handlePriorityChange}
        />

        <SelectStatus
          variant="detail"
          value={status}
          useExtendedLabels={true}
          onValueChange={handleStatusChange}
        />
        <ConvertToTask triageId={triageId} />
        <DeclineTriage triageId={triageId} />
      </div>
      <Separator className="my-4" />
      <div className="min-h-56 overflow-y-auto">
        {isDescriptionReady ? (
          <BlockEditor
            editor={editor}
            onChange={handleDescriptionChange}
            className="min-h-full read-only"
          />
        ) : (
          <Spinner />
        )}
      </div>
      <ActivityList contentId={triageId} contentDetail={triage} />
      <TriageConversionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmConversion}
      />
    </div>
  );
};
