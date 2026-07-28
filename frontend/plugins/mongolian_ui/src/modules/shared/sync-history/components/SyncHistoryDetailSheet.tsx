import { useTranslation } from 'react-i18next';
import { Sheet } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { stringifySyncValue } from './stringifySyncValue';

export interface ISyncHistoryFields {
  _id: string;
  contentType: string;
  content: string;
  contentId: string;
  consumeData: unknown;
  consumeStr: string;
  sendData: unknown;
  sendStr: string;
  responseData: unknown;
  responseStr: string;
  error: string;
}

const DetailBlock = ({ title, value }: { title: string; value: unknown }) => (
  <section className="space-y-2">
    <h3 className="text-sm font-medium">{title}</h3>
    <pre className="max-h-72 overflow-auto rounded border bg-muted/30 p-3 text-xs whitespace-pre-wrap wrap-break-word">
      {stringifySyncValue(value) || '-'}
    </pre>
  </section>
);

export const SyncHistoryDetailSheet = <T extends ISyncHistoryFields>({
  histories,
}: {
  histories: T[];
}) => {
  const { t } = useTranslation('mongolian');
  const [searchParams, setSearchParams] = useSearchParams();
  const syncHistoryId = searchParams.get('syncHistory_id');
  const history = histories.find((item) => item._id === syncHistoryId);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('syncHistory_id');
    setSearchParams(nextParams);
  };

  return (
    <Sheet open={Boolean(syncHistoryId)} onOpenChange={handleOpenChange} modal>
      <Sheet.View className="sm:max-w-3xl">
        <Sheet.Header>
          <Sheet.Title>{t('sync-history-detail')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-y-auto p-5 space-y-5">
          {history ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">{t('content-type')}</div>
                  <div className="font-medium">
                    {history.contentType || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t('content')}</div>
                  <div className="font-medium">
                    {history.content || history.contentId}
                  </div>
                </div>
              </div>
              <DetailBlock
                title={t('consume')}
                value={history.consumeData || history.consumeStr}
              />
              <DetailBlock
                title={t('send')}
                value={history.sendData || history.sendStr}
              />
              <DetailBlock
                title={t('response')}
                value={history.responseData || history.responseStr}
              />
              <DetailBlock title={t('error')} value={history.error} />
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              {t('history-not-found')}
            </div>
          )}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
