import {
  Input,
  Separator,
  useBlockEditor,
  BlockEditor,
  Dialog,
  Button,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useUpdateTriage } from '@/triage/hooks/useUpdateTriage';
import { useDebounce } from 'use-debounce';
import { useEffect, useState } from 'react';
import { Block } from '@blocknote/core';
import { ITriageDetail } from '@/triage/types/triage';
import { ActivityList } from '@/activity/components/ActivityList';
import { SelectPriority } from '@/operation/components/SelectPriority';
import { ConvertToTask } from './triage-selects/ConvertToTask';
import { DeclineTriage } from './triage-selects/DeclineTriage';
import { SelectStatus } from '@/operation/components/SelectStatus';
import { useConvertTriage } from '../hooks/useConvertTriage';
import { STATUS_TYPES } from '@/operation/components/StatusInline';
import { parseDescriptionBlocks } from '@/operation/utils/parseDescriptionBlocks';
import { IconBrandGithub, IconExternalLink } from '@tabler/icons-react';
import { isGithubTriage } from '@/operation/utils/isGithubTriage';

export const TriageFields = ({ triage }: { triage: ITriageDetail }) => {
  const { t } = useTranslation('operation');
  const {
    _id: triageId,
    priority,
    status,
    name: _name,
    githubIssueNumber,
    githubRepoName,
  } = triage;

  const description = triage?.description;
  const initialDescriptionContent = parseDescriptionBlocks(description);

  const [descriptionContent, setDescriptionContent] = useState<
    Block[] | undefined
  >(initialDescriptionContent);

  const editor = useBlockEditor({
    initialContent: descriptionContent,
    placeholder: t('description-placeholder'),
  });
  const { updateTriage } = useUpdateTriage();
  const { convertTriageToTask } = useConvertTriage();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<number | null>(null);

  const [name, setName] = useState(_name);

  const handleDescriptionChange = async () => {
    const content = await editor?.document;
    if (content) {
      content.pop();
      setDescriptionContent(content as Block[]);
    }
  };

  const [debouncedDescriptionContent] = useDebounce(descriptionContent, 1000);
  const [debouncedName] = useDebounce(name, 1000);

  useEffect(() => {
    if (!debouncedName || debouncedName === _name) return;
    updateTriage({
      variables: {
        _id: triageId,
        input: {
          name: debouncedName,
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName]);

  useEffect(() => {
    if (!debouncedDescriptionContent) return;
    if (
      JSON.stringify(debouncedDescriptionContent) ===
      JSON.stringify(parseDescriptionBlocks(description))
    ) {
      return;
    }
    updateTriage({
      variables: {
        _id: triageId,
        input: {
          description: JSON.stringify(debouncedDescriptionContent),
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDescriptionContent]);

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
      <Input
        className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
        placeholder={t('triage-name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="gap-2 flex flex-wrap w-full">
        <SelectPriority
          variant="detail"
          value={priority}
          onValueChange={(value) => {
            updateTriage({
              variables: {
                _id: triageId,
                input: {
                  priority: Number(value),
                },
              },
            });
          }}
        />

        <SelectStatus
          variant="detail"
          value={status}
          useExtendedLabels={true}
          onValueChange={(value) => {
            if (value !== STATUS_TYPES.TRIAGE) {
              setPendingStatus(value);
              setConfirmOpen(true);
            }
          }}
        />
        <ConvertToTask triageId={triageId} />
        <DeclineTriage triageId={triageId} />
      </div>
      <Separator className="my-4" />
      <div className="min-h-56 overflow-y-auto">
        <BlockEditor
          editor={editor}
          onChange={handleDescriptionChange}
          className="min-h-full read-only"
        />
      </div>
      <ActivityList contentId={triageId} contentDetail={triage} />
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{t('convert-to-task')}</Dialog.Title>
          </Dialog.Header>
          <div className="py-4">
            <p>{t('convert-triage-confirm')}</p>
          </div>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="outline">{t('cancel')}</Button>
            </Dialog.Close>
            <Button
              onClick={() => {
                if (pendingStatus) {
                  convertTriageToTask({
                    variables: { id: triageId, status: pendingStatus },
                  });
                }
                setConfirmOpen(false);
              }}
            >
              {t('confirm')}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
