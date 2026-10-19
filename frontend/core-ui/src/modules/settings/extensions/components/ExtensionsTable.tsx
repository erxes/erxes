import { Badge, Table } from 'erxes-ui';
import { Extension } from '../types';
import { ExtensionActions } from './ExtensionActions';

export function ExtensionsTable({
  data,
  onChanged,
}: Readonly<{ data: Extension[]; onChanged: () => void }>) {
  return (
    <div className="m-3 overflow-x-auto rounded-md border">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Extension</Table.Head>
            <Table.Head>Version</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head className="w-10" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((ext) => (
            <Table.Row key={ext.extId}>
              <Table.Cell className="font-medium">{ext.extId}</Table.Cell>
              <Table.Cell>{ext.version}</Table.Cell>
              <Table.Cell>
                <Badge
                  variant={ext.status === 'installed' ? 'success' : 'warning'}
                >
                  {ext.status === 'installed' ? 'Enabled' : 'Disabled'}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <ExtensionActions ext={ext} onChanged={onChanged} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
