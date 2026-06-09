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
          <Sheet.Title>Sync history detail</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-y-auto p-5 space-y-5">
          {history ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Content type</div>
                  <div className="font-medium">
                    {history.contentType || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Content</div>
                  <div className="font-medium">
                    {history.content || history.contentId}
                  </div>
                </div>
              </div>
              <DetailBlock
                title="Consume"
                value={history.consumeData || history.consumeStr}
              />
              <DetailBlock
                title="Send"
                value={history.sendData || history.sendStr}
              />
              <DetailBlock
                title="Response"
                value={history.responseData || history.responseStr}
              />
              <DetailBlock title="Error" value={history.error} />
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              History not found.
            </div>
          )}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
