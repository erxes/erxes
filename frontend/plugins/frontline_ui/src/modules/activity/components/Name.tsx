import { IActivity } from '@/activity/types';

export const Name = ({ metadata }: { metadata: IActivity['metadata'] }) => {
  return (
    <div>
      renamed the task to{' '}
      <span className="font-bold">"{metadata.newValue}"</span>
    </div>
  );
};
