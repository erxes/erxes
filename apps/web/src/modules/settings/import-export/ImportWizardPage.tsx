import type { Import } from '@erxes/core-contract';
import { IconArrowBackUp, IconFileImport, IconPlayerPlay, IconSearch } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  PageContainer,
  PageHeader,
  ScrollArea,
  Spinner,
  useConfirm,
  useToast,
  AppBreadcrumb,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { paths } from '~/lib/paths';
import { importQuery, useTransferLabel } from '~/modules/transfer/useTransfer';
import { ErrorRows, ImportProgress, ImportSummary } from './ImportResults';
import { type ImportChanges, ImportMapping, ImportOptionsForm } from './ImportSetup';

/** Every step answers with the import as it now stands. */
const useImportActions = (id: string) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'import-export' });
  const { toast } = useToast();
  const client = useQueryClient();

  const handlers = {
    onSuccess: (next: Import) => client.setQueryData(importQuery(id).queryKey, next),
    onError: (error: Error) =>
      toast({
        variant: 'destructive',
        title: t('failed', 'Something went wrong'),
        description: messageOf(error),
      }),
  };

  return {
    update: useMutation(orpc.transfer.updateImport.mutationOptions(handlers)),
    check: useMutation(orpc.transfer.checkImport.mutationOptions(handlers)),
    start: useMutation(orpc.transfer.startImport.mutationOptions(handlers)),
    undo: useMutation(orpc.transfer.undoImport.mutationOptions(handlers)),
  };
};

const WizardActions = ({
  imp,
  noun,
  actions,
}: {
  imp: Import;
  noun: string;
  actions: ReturnType<typeof useImportActions>;
}) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'import-export' });
  const { confirm } = useConfirm();
  const { check, start, undo } = actions;
  const editable = imp.status === 'mapping' || imp.status === 'checked';
  const id = imp.id;

  const confirmUndo = () =>
    void confirm({
      message: t(
        'undo-confirm',
        'Remove the {{count}} {{noun}} this import created? They go to the recycle bin; updates stay.',
        { count: imp.counts.create, noun },
      ),
    }).then(() => undo.mutate({ id }));

  return (
    <>
      {editable && (
        <>
          <Button variant="outline" disabled={check.isPending} onClick={() => check.mutate({ id })}>
            <IconSearch />
            {t('check', 'Check')}
          </Button>
          <Button disabled={start.isPending} onClick={() => start.mutate({ id })}>
            <IconPlayerPlay />
            {t('start', 'Import {{count}} rows', { count: imp.counts.rows })}
          </Button>
        </>
      )}
      {imp.undoable && (
        <Button
          variant="outline"
          tone="destructive"
          disabled={undo.isPending}
          onClick={confirmUndo}
        >
          <IconArrowBackUp />
          {t('undo', 'Undo import')}
        </Button>
      )}
    </>
  );
};

/**
 * One import, step by step: map the file's columns (suggested from their
 * names, with sample values), choose how rows find existing records, check
 * (a dry run), run, and undo within 30 days.
 */
export const ImportWizardPage = () => {
  const { id = '' } = useParams();
  const { t } = useTranslation('workspace', { keyPrefix: 'import-export' });
  const query = useQuery(importQuery(id));
  const actions = useImportActions(id);
  const labelOf = useTransferLabel();
  const imp = query.data;

  if (query.error) {
    return (
      <p className="py-12 text-center text-sm text-destructive-text">{messageOf(query.error)}</p>
    );
  }

  if (!imp) return <Spinner area="lg" />;

  const editable = imp.status === 'mapping' || imp.status === 'checked';
  const noun = labelOf(imp.recordType);
  const change = (changes: ImportChanges) => actions.update.mutate({ id, ...changes });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Import & export history'),
                to: paths.contacts.importExport,
                icon: IconFileImport,
              },
              { label: imp.fileName, to: paths.contacts.importOrExport(id) },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          <WizardActions imp={imp} noun={noun} actions={actions} />
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          <ImportProgress imp={imp} />
          <ImportSummary imp={imp} noun={noun} />
          <ErrorRows key={imp.status} imp={imp} />
          {editable && (
            <>
              <ImportMapping imp={imp} disabled={actions.update.isPending} onChange={change} />
              <ImportOptionsForm imp={imp} onChange={change} />
            </>
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
