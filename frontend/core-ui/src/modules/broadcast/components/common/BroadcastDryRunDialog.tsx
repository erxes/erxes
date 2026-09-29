import { useBroadcastDryRun } from '@/broadcast/hooks/useBroadcastDryRun';
import { IconAlertTriangle, IconCheck, IconRefresh } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Dialog,
  EmailPreviewFrame,
  Spinner,
  Table,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * A rehearsal: the campaign is rendered for a few of the people it would
 * really reach, and nothing is sent.
 *
 * It exists to answer the one question a finished campaign cannot. A field
 * empty for three of twenty is those three records; a field empty for all
 * twenty was never connected to anything.
 */
export const BroadcastDryRunDialog = ({
  campaignId,
  open,
  onOpenChange,
}: {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'dryRun' });
  const { dryRun, loading, error, rerun } = useBroadcastDryRun(
    campaignId,
    open,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="flex h-[80vh] flex-col sm:max-w-3xl">
        <Dialog.Header>
          <Dialog.Title>{t('title')}</Dialog.Title>
          <Dialog.Description>{t('description')}</Dialog.Description>
        </Dialog.Header>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-destructive">
            {error.message}
          </div>
        ) : !dryRun?.sampled ? (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
            {t('empty')}
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6">
            <div className="text-sm text-muted-foreground">
              {t('sampled', { count: dryRun.sampled })}
            </div>

            {dryRun.unresolved.length ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <IconAlertTriangle className="size-4" />
                  {t('unresolved')}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('unresolved-body')}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {dryRun.unresolved.map((placeholder) => (
                    <Badge key={placeholder} variant="destructive">
                      {`{{ ${placeholder} }}`}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                <IconCheck className="size-4 text-success" />
                {t('all-resolved')}
              </div>
            )}

            {!!dryRun.fields.length && (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>{t('field')}</Table.Head>
                    <Table.Head className="w-28 text-right">
                      {t('filled')}
                    </Table.Head>
                    <Table.Head className="w-28 text-right">
                      {t('missing')}
                    </Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {dryRun.fields.map((field) => (
                    <Table.Row key={field.id}>
                      <Table.Cell className="font-mono text-xs">
                        {field.id}
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        {field.filled}
                      </Table.Cell>
                      <Table.Cell
                        className={
                          field.missing === dryRun.sampled
                            ? 'text-right font-medium text-destructive'
                            : 'text-right'
                        }
                      >
                        {field.missing}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}

            {!!dryRun.sampleHtml && (
              <div className="flex flex-col">
                <div className="py-2 font-mono text-xs uppercase text-accent-foreground">
                  {t('sample', { to: dryRun.sampleTo })}
                </div>
                <EmailPreviewFrame
                  html={dryRun.sampleHtml}
                  className="h-[28rem] rounded-md border"
                />
              </div>
            )}
          </div>
        )}

        <Dialog.Footer>
          <Button variant="secondary" onClick={rerun} disabled={loading}>
            <IconRefresh className="size-4" />
            {t('run')}
          </Button>
          <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
