import { IconBook } from '@tabler/icons-react';
import { Empty, Skeleton } from 'erxes-ui';

const SKELETON_ROWS = ['first', 'second', 'third', 'fourth', 'fifth'];

export const KbEmptyState = ({
  title,
  text,
}: {
  title: string;
  text: string;
}) => (
  <Empty className="py-16 text-foreground">
    <Empty.Header>
      <Empty.Media>
        <IconBook />
      </Empty.Media>
      <Empty.Title>{title}</Empty.Title>
      <Empty.Description>{text}</Empty.Description>
    </Empty.Header>
  </Empty>
);

export const KbLoadingState = () => (
  <div className="flex flex-col gap-2">
    {SKELETON_ROWS.map((row) => (
      <Skeleton key={row} className="h-16 w-full rounded-xl" />
    ))}
  </div>
);
