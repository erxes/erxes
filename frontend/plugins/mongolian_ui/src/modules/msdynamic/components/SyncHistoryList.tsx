import React from 'react';
import dayjs from 'dayjs';

import { Sidebar } from 'erxes-ui/components/sidebar';
import { Table } from 'erxes-ui/components/table';
import { Dialog } from 'erxes-ui/components/dialog';
import { Button } from 'erxes-ui/components/button';

import SideBar from './Sidebar';

type Props = {
  queryParams: any;
  syncHistories: any[];
  totalCount: number;
  loading: boolean;
};

const SyncHistoryList = ({
  queryParams,
  syncHistories,
  totalCount,
  loading,
}: Props) => {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <Sidebar className="w-72 border-r">
        <SideBar queryParams={queryParams} />
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Sync Histories ({totalCount})
          </h2>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Content Type</th>
                <th>Content</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {(syncHistories || []).map((item) => (
                <tr key={item._id} className="hover:bg-muted cursor-pointer">
                  <td>{dayjs(item.createdAt).format('lll')}</td>
                  <td>{item.createdUser?.email}</td>
                  <td>{item.contentType}</td>
                  <td>{item.content}</td>
                  <td>{item.error || ''}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {loading && (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
      </div>
    </div>
  );
};

export default SyncHistoryList;
