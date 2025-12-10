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
    <Link
      to={`/sales/pos/${pos._id}`}
      className="p-2 rounded-2xl border h-[200px]"
    >
      <div className="grid grid-cols-2 h-full">
        <div className="flex overflow-hidden relative justify-center items-center w-full h-full rounded-xl">
          {coverImage ? (
            <img
              src={readImage(coverImage)}
              alt={pos.name}
              className="object-cover object-center w-full h-full"
            />
          ) : (
            <IconPhotoCirclePlus className="size-8 text-scroll" />
          )}
          <div className="absolute inset-0 rounded-xl border border-foreground/10" />
        </div>

        <div className="flex flex-col gap-3 px-4 py-2 min-h-0">
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
      <div className="overflow-y-auto p-6 h-full">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="p-2 rounded-2xl border h-[200px] animate-pulse bg-muted"
            >
              <div className="grid grid-cols-2 gap-2 h-full">
                <div className="rounded-xl border bg-background"></div>
                <div className="flex flex-col gap-3 px-4 py-2">
                  <div className="flex gap-3 justify-between">
                    <div className="w-20 h-6 rounded border bg-background"></div>
                    <div className="w-16 h-6 rounded-full border bg-background"></div>
                  </div>
                  <div className="w-20 h-6 rounded-full border bg-background"></div>
                  <div className="w-32 h-4 rounded border bg-background"></div>
                  <div className="w-28 h-4 rounded border bg-background"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto p-6 h-full">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {posList?.map((pos: IPos) => (
          <PosCard key={pos._id} pos={pos} />
        ))}
      </div>
    </div>
  );
};
