import { IconEdit, IconTrash, IconWorldPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';
import { useSetAtom } from 'jotai';
import { webDrawerState } from '../states/webBuilderState';
import { useRemoveWeb } from '../hooks/useRemoveWeb';
import { IWeb } from '../types';
import { THUMBNAIL_GRADIENTS } from '../constants';

interface WebListItemProps {
  web: IWeb;
  index: number;
}

export const WebListItem = ({ web, index }: WebListItemProps) => {
  const setDrawer = useSetAtom(webDrawerState);
  const { removeWeb } = useRemoveWeb();
  const { confirm } = useConfirm();

  const gradient = THUMBNAIL_GRADIENTS[index % THUMBNAIL_GRADIENTS.length];
  const thumbnailUrl = web.thumbnail?.url;

  const handleEdit = () => setDrawer({ open: true, editingWeb: web });

  const handleDelete = () =>
    confirm({
      message: `Are you sure you want to delete "${web.name}"?`,
    }).then(() => removeWeb(web._id));

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 ${thumbnailUrl ? 'bg-gray-100' : gradient} rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden`}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={web.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <IconWorldPlus className="w-5 h-5 text-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{web.name}</h3>
          <p className="text-sm text-gray-500 truncate">
            {web.description || 'No description'}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            {web.domain && <span className="font-medium">{web.domain}</span>}
            {web.templateType && (
              <span className="capitalize">{web.templateType}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleEdit}
            title="Edit"
          >
            <IconEdit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            title="Delete"
            className="text-destructive hover:text-destructive"
          >
            <IconTrash className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
