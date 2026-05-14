import { IconLayoutGrid, IconList, IconWorldPlus } from '@tabler/icons-react';
import { Spinner, ToggleGroup } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { EmptyState } from '../../cms/shared/EmptyState';
import { useGetWebList } from '../hooks/useGetWebList';
import { webDrawerState, webViewModeState } from '../states/webBuilderState';
import { WebCard } from './WebCard';
import { WebListItem } from './WebListItem';

export const WebList = () => {
  const [viewMode, setViewMode] = useAtom(webViewModeState);
  const { webs, loading } = useGetWebList();
  const setDrawer = useSetAtom(webDrawerState);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!webs || webs.length === 0) {
    return (
      <EmptyState
        icon={IconWorldPlus}
        title="No web projects yet"
        description="Get started by creating your first web builder project."
        actionLabel="New Web Project"
        onAction={() => setDrawer({ open: true, editingWeb: null })}
      />
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">Found {webs.length} results</div>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => v && setViewMode(v as 'thumbnail' | 'list')}
        >
          <ToggleGroup.Item value="list" aria-label="List view">
            <IconList className="h-4 w-4" />
          </ToggleGroup.Item>
          <ToggleGroup.Item value="thumbnail" aria-label="Thumbnail view">
            <IconLayoutGrid className="h-4 w-4" />
          </ToggleGroup.Item>
        </ToggleGroup>
      </div>

      {viewMode === 'thumbnail' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {webs.map((web, index) => (
            <WebCard key={web._id} web={web} index={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {webs.map((web, index) => (
            <WebListItem key={web._id} web={web} index={index} />
          ))}
        </div>
      )}
    </>
  );
};
