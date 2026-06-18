import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import {
  Empty,
  EnumCursorDirection,
  Skeleton,
  useMultiQueryState,
} from 'erxes-ui';
import { IResponseTemplate } from '../types';
import { IconGitBranch } from '@tabler/icons-react';
import { CreateResponse } from '@/responseTemplate/components/CreateResponse';
import { ResponseCard } from '@/responseTemplate/components/ResponseCard';
import { useEffect, useRef } from 'react';

export const ResponseList = ({ channelId }: { channelId: string }) => {
  const [{ searchValue }] = useMultiQueryState<{ searchValue?: string }>([
    'searchValue',
  ]);

  const { responses, isInitialLoad, handleFetchMore, pageInfo } =
    useGetResponses({
      variables: {
        filter: { channelId, searchValue: searchValue || undefined },
      },
    });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !pageInfo?.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleFetchMore({ direction: EnumCursorDirection.FORWARD });
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [pageInfo?.hasNextPage, handleFetchMore]);

  if (isInitialLoad) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 p-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  }

  if (responses?.length === 0) {
    return (
      <Empty className="bg-sidebar rounded-lg m-3">
        <Empty.Header>
          <Empty.Media>
            <IconGitBranch />
          </Empty.Media>
          <Empty.Title>
            {searchValue ? 'No results found' : 'No responses yet'}
          </Empty.Title>
          <Empty.Description>
            {searchValue
              ? 'Try a different search term'
              : 'Get started by creating your first response'}
          </Empty.Description>
        </Empty.Header>
        {!searchValue && (
          <Empty.Content>
            <CreateResponse />
          </Empty.Content>
        )}
      </Empty>
    );
  }

  return (
    <div className="overflow-auto h-full">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 p-3">
        {(responses || []).map((response: IResponseTemplate) => (
          <ResponseCard key={response._id} response={response} />
        ))}
      </div>
      {pageInfo?.hasNextPage && (
        <div
          ref={sentinelRef}
          className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 px-3 pb-3"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-xl" />
          ))}
        </div>
      )}
    </div>
  );
};
