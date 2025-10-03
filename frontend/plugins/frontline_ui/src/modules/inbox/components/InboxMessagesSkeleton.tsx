import { Skeleton } from 'erxes-ui';
import React from 'react';
import { useEffect, useState } from 'react';

export const InboxMessagesSkeleton = ({
  isFetched,
}: {
  isFetched?: boolean;
}) => {
  const [display, setDisplay] = useState(true);

  useEffect(() => {
    if (isFetched) {
      setTimeout(() => {
        setDisplay(false);
      }, 100);
    }
  }, [isFetched]);

  if (!display) return null;

  return (
    <div className="absolute inset-0 bg-background">
      <div className="flex flex-col max-w-[648px] mx-auto p-6">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-7 w-36" />
              </div>
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-7 w-32 ml-auto" />
              <div className="inline-flex items-center gap-2 justify-end">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-7 w-36" />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
