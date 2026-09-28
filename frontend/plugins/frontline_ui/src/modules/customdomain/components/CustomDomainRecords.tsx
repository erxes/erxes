import { IconCopy } from '@tabler/icons-react';
import { CopyText, Table } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CustomDomainStatusBadge } from '@/customdomain/components/CustomDomainStatusBadge';
import { ICustomDomainRecord } from '@/customdomain/types';

const CopyableValue = ({ value }: { value: string }) => {
  if (!value) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <CopyText
      value={value}
      className="max-w-full text-left font-mono text-xs break-all hover:text-primary"
    >
      <span>{value}</span>
      <IconCopy className="size-3.5 shrink-0 text-muted-foreground" />
    </CopyText>
  );
};

export const CustomDomainRecords = ({
  records,
}: {
  records: ICustomDomainRecord[];
}) => {
  const { t } = useTranslation('frontline');

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table className="min-w-[640px]">
        <Table.Header>
          <Table.Row>
            <Table.Head className="w-48">
              {t('customdomain-type', 'Type')}
            </Table.Head>
            <Table.Head>{t('customdomain-name', 'Name')}</Table.Head>
            <Table.Head>{t('customdomain-value', 'Value')}</Table.Head>
            <Table.Head className="w-28">{t('status', 'Status')}</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {records.map((record) => (
            <Table.Row key={`${record.type}-${record.name}`}>
              <Table.Cell className="font-medium">{record.type}</Table.Cell>
              <Table.Cell>
                <CopyableValue value={record.name} />
              </Table.Cell>
              <Table.Cell>
                <CopyableValue value={record.value} />
              </Table.Cell>
              <Table.Cell>
                <CustomDomainStatusBadge status={record.status} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};
