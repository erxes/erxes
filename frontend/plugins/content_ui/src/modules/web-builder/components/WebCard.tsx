import {
  IconEdit,
  IconHammer,
  IconTrash,
  IconWorldPlus,
} from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';
import { useSetAtom } from 'jotai';
import { webDrawerState } from '../states/webBuilderState';
import { useRemoveWeb } from '../hooks/useRemoveWeb';
import { IWeb } from '../types';
import { REACT_APP_WEBBUILDER_URL } from '@/utils';

interface WebCardProps {
  web: IWeb;
  index: number;
}

export const WebCard = ({ web, index }: WebCardProps) => {
  const setDrawer = useSetAtom(webDrawerState);
  const { removeWeb } = useRemoveWeb();
  const { confirm } = useConfirm();

  const thumbnailUrl = web.thumbnail?.url;

  const sessionCode = sessionStorage.getItem('sessioncode') || '';
  const buildUrl = `${REACT_APP_WEBBUILDER_URL}/dashboard/projects/${
    web._id
  }?template=${web.templateId || ''}&cpId=${
    web.clientPortalId
  }&pageName=home&sessioncode=${sessionCode}`;

  const handleEdit = () => setDrawer({ open: true, editingWeb: web });

  const handleDelete = () =>
    confirm({
      message: `Are you sure you want to delete "${web.name}"?`,
    }).then(() => removeWeb(web._id));

  return (
    <div className="bg-white h-full rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      <div className={`aspect-video relative overflow-hidden bg-gray-100`}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={web.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <IconWorldPlus className="w-8 h-8 text-white" />
            </div>
          </div>
        )}
        {web.domain && (
          <div className="absolute bottom-2 right-2">
            <div className="px-2 py-1 bg-white/90 rounded text-xs font-medium text-gray-700">
              {web.domain}
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
          {web.name}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[2.5rem]">
          {web.description || 'No description'}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {web.templateType && (
              <span className="capitalize">{web.templateType}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              onClick={() =>
                window.open(buildUrl, '_blank', 'noopener,noreferrer')
              }
              title="Build"
            >
              <IconHammer className="w-3.5 h-3.5 mr-1" />
              Build
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              title="Edit"
            >
              <IconEdit className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              title="Delete"
              className="text-destructive hover:text-destructive"
            >
              <IconTrash className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
