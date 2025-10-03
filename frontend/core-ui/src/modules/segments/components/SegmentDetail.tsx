import { ApolloQueryResult, OperationVariables } from '@apollo/client';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { ISegment, ListQueryResponse, SegmentForm } from 'ui-modules';

type Props = {
  refetch: (
    variables?: Partial<OperationVariables> | undefined,
  ) => Promise<ApolloQueryResult<ListQueryResponse>>;
};

export function SegmentDetail({ refetch }: Props) {
  const [selectedContentType] = useQueryState<string>('contentType');

  if (!selectedContentType) {
    return null;
  }

  const [segmentId, setOpen] = useQueryState<string>('segmentId');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  let segment: ISegment | undefined;

  return (
    <Sheet
      open={!!segmentId || isCreatingNew}
      onOpenChange={() => {
        if (segmentId) {
          setOpen(null);
        } else {
          setIsCreatingNew(!isCreatingNew);
        }
      }}
    >
      <Sheet.Trigger asChild>
        <Button
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          disabled={!selectedContentType}
        >
          <IconPlus /> Create Segment
        </Button>
      </Sheet.Trigger>

      <Sheet.View
        className="p-0 md:max-w-screen-lg"
        onEscapeKeyDown={(e: any) => {
          e.preventDefault();
        }}
      >
        <Sheet.Content className="h-full">
          <div className="h-full flex flex-col">
            <Sheet.Header className="border-b p-3 flex-row items-center space-y-0 gap-3">
              <Sheet.Title>{`${
                segment ? 'Edit' : 'Create'
              } a segment`}</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <SegmentForm
              contentType={selectedContentType}
              segmentId={segmentId || ''}
              callback={() => refetch()}
            />
          </div>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
}
