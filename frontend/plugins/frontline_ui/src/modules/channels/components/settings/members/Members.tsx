import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';
import { RecordTable, RecordTableTree, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AddMembers } from './AddMembers';
import { MemberCommandBar } from './MemberCommandBar';
import columns from './MembersColumn';

export function Members() {
  const { id: channelId } = useParams<{ id: string }>();
  const { members, loading } = useGetChannelMembers({ channelIds: channelId });
  const { t } = useTranslation('members');

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="overflow-auto h-full px-8 hide-scroll styled-scroll scroll-smooth">
      <div className="ml-auto flex justify-between py-6">
        <h1 className="text-xl font-semibold">Members</h1>
        <AddMembers />
      </div>
      <div className="bg-sidebar border border-sidebar pl-1 border-t-4 border-l-4 pb-2 pr-2 rounded-lg">
        <RecordTable.Provider
          columns={columns(t)}
          data={members || []}
          stickyColumns={['more', 'checkbox', 'name']}
          className="mt-1.5"
        >
          <RecordTableTree id="members" ordered>
            <RecordTable.Scroll>
              <RecordTable className="w-full">
                <RecordTable.Header />
                <RecordTable.Body>
                  <RecordTable.RowList Row={RecordTableTree.Row} />
                  {loading && <RecordTable.RowSkeleton rows={40} />}
                </RecordTable.Body>
              </RecordTable>
            </RecordTable.Scroll>
          </RecordTableTree>
          <MemberCommandBar />
        </RecordTable.Provider>
      </div>
    </div>
  );
}
