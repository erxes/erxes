import React from 'react';
import dayjs from 'dayjs';

import { Sidebar } from 'erxes-ui/components/sidebar';
import { Table } from 'erxes-ui/components/table';

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
    <div className="flex h-full w-full bg-white">
      {/* Sidebar */}
      <Sidebar className="w-72 border-r bg-gray-50">
        <SideBar queryParams={queryParams} />
      </Sidebar>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Sync Histories ({totalCount})
          </h2>
        </div>

        {/* Table OR Empty */}
        <div className="flex-1 border rounded-lg overflow-hidden bg-white">
          {hasData ? (
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
                {syncHistories.map((item) => (
                  <tr key={item._id} className="hover:bg-muted cursor-pointer">
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
            <div className="flex flex-col items-center justify-center h-full py-24 text-gray-400">
              <img
                src="/images/empty-state.svg"
                alt="empty"
                className="w-64 mb-4 opacity-80"
              />
              <p>There is no data</p>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-sm text-gray-400 mt-4">Loading...</div>
        )}
      </div>
    </div>
  );
};

export default SyncHistoryList;
