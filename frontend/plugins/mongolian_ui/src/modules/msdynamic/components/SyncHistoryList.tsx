import dayjs from 'dayjs';
import { Sidebar } from 'erxes-ui/components/sidebar';
import { Table } from 'erxes-ui/components/table';
import { IconInbox } from '@tabler/icons-react';
import SideBar from './Sidebar';

type Props = {
  queryParams: any;
  syncHistories: any[];
  totalCount: number;
  loading: boolean;
};

const SyncHistoryList = ({
  queryParams,
  syncHistories = [],
  totalCount,
  loading,
}: Props) => {
  const hasData = syncHistories.length > 0;

  return (
    <Sidebar.Inset>
      <div className="flex h-full">
        {/* Filter sidebar */}
        <div className="w-72 border-r bg-muted/20">
          <SideBar queryParams={queryParams} />
        </div>

        {/* Main */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Sync Histories ({totalCount})
            </h2>
          </div>

          <div className="flex-1 border rounded-lg overflow-hidden">
            {hasData ? (
              <Table>
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Content Type</th>
                    <th>Content</th>
                    <th>Error</th>
                  </tr>
                </thead>

                <tbody>
                  {syncHistories.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-muted cursor-pointer"
                    >
                      <td>{dayjs(item.createdAt).format('lll')}</td>
                      <td>{item.createdUser?.email}</td>
                      <td>{item.contentType}</td>
                      <td>{item.content}</td>
                      <td className="text-red-500">{item.error || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
                <IconInbox size={80} className="opacity-70 mb-4" />
                <p>There is no data</p>
              </div>
            )}
          </div>

          {loading && (
            <div className="text-sm text-muted-foreground mt-4">Loading...</div>
          )}
        </div>
      </div>
    </Sidebar.Inset>
  );
};

export default SyncHistoryList;
