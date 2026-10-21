import { Spinner, Table } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFileSheetPreview } from '../hooks/useFileSheetPreview';

export const FileSheetPreview = ({
  url,
  isCsv,
}: {
  url: string;
  isCsv: boolean;
}) => {
  const { t } = useTranslation('files');
  const sheet = useFileSheetPreview(url, isCsv);

  if (sheet.loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (sheet.error) {
    return <div className="p-4 text-sm text-destructive">{sheet.error}</div>;
  }

  if (!sheet.header.length) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {t('sheet-empty')}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      {(sheet.truncated || sheet.otherSheets > 0) && (
        <div className="border-b bg-background px-3 py-2 text-xs text-muted-foreground">
          {sheet.truncated && t('sheet-truncated', { count: sheet.maxRows })}{' '}
          {sheet.otherSheets > 0 &&
            t('sheet-first-only', {
              name: sheet.sheetName,
              count: sheet.otherSheets,
            })}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto bg-background">
        <Table>
          <Table.Header>
            <Table.Row>
              {sheet.header.map((cell, i) => (
                <Table.Head key={i} className="whitespace-nowrap">
                  {cell}
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sheet.body.map((row, rowIndex) => (
              <Table.Row key={rowIndex}>
                {row.map((cell, i) => (
                  <Table.Cell
                    key={i}
                    className="max-w-xs truncate whitespace-nowrap"
                  >
                    {cell}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};
