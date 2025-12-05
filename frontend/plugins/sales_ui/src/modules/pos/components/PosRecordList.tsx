import React from 'react';
import { Badge, readImage } from 'erxes-ui';
import { usePosList } from '../hooks/usePosList';
import { IPos } from '../types/pos';
import { IconPhotoCirclePlus } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

interface PosCardProps {
  pos: IPos;
}

const PosCard: React.FC<PosCardProps> = ({ pos }) => {
  const coverImage = pos?.logo || pos?.uiOptions?.logo;

  return (
    <Link to={`/sales/pos/${pos._id}`} className="p-2 rounded-2xl border">
      <div className="grid grid-cols-2">
        <div className="flex overflow-hidden relative justify-center items-center w-full h-full rounded-xl aspect-2/1">
          {coverImage ? (
            <img
              src={readImage(coverImage)}
              alt={pos.name}
              className="w-full h-full object-cover object-center max-h-[220px]"
            />
          ) : (
            <IconPhotoCirclePlus className="size-8 text-scroll" />
          )}
          <div className="absolute inset-0 rounded-xl border border-foreground/10" />
        </div>

        <div className="flex flex-col gap-3 px-4 py-2">
          <div className="flex justify-between">
            <h3 className="text-lg font-medium truncate">
              {pos.name || 'No name'}
            </h3>
            <Badge variant={pos.isOnline ? 'success' : 'secondary'}>
              {pos.isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          <Badge variant="default">{pos.type || 'N/A'}</Badge>

          {pos.branchTitle && (
            <div className="flex gap-2 items-center text-accent-foreground">
              <p className="text-sm">{pos.branchTitle}</p>
            </div>
          )}
          {pos.departmentTitle && (
            <div className="flex gap-2 items-center text-accent-foreground">
              <p className="text-sm">{pos.departmentTitle}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export const PosCardGrid = () => {
  const { posList, loading } = usePosList();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: posList?.length || 0 }).map((_, index) => (
          <div
            key={index}
            className="p-4 bg-gray-800 rounded-lg border border-gray-700 animate-pulse"
          >
            <div className="flex gap-2 items-center mb-3">
              <div className="w-8 h-8 bg-gray-600 rounded"></div>
              <div className="w-20 h-4 bg-gray-600 rounded"></div>
            </div>
            <div className="mb-4 space-y-2">
              <div className="w-16 h-3 bg-gray-600 rounded"></div>
              <div className="w-24 h-3 bg-gray-600 rounded"></div>
              <div className="w-20 h-3 bg-gray-600 rounded"></div>
              <div className="w-16 h-3 bg-gray-600 rounded"></div>
            </div>
            <div className="flex gap-4 mb-3">
              <div className="w-8 h-3 bg-gray-600 rounded"></div>
              <div className="w-8 h-3 bg-gray-600 rounded"></div>
              <div className="w-8 h-3 bg-gray-600 rounded"></div>
            </div>
            <div className="h-1 bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {posList?.map((pos: IPos) => (
          <PosCard key={pos._id} pos={pos} />
        ))}
      </div>
    </div>
  );
};
