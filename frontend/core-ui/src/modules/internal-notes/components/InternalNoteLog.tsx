import { useActivityItemContext } from '@/activity-logs/context/ActivityItemContext';
import { InternalNoteDisplay } from 'ui-modules';

export const InternalNoteLog = () => {
  const { content } = useActivityItemContext();
  return <InternalNoteDisplay content={content} />;
};
