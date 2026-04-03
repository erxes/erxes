import { IActivity } from '@/activity/types';
export const ActivityNote = ({
  action,
}: {
  action: IActivity['action'];
}) => {
  return <div className="lowercase">{action} note</div>;
};
