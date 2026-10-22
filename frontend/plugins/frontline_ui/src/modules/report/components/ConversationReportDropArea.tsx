import { useDroppable } from '@dnd-kit/core';
import type { ConversationReportDropAreaProps } from '@/report/types/conversationReportLayout';

export function ConversationReportDropArea({
  id,
  colSpan,
  children,
}: ConversationReportDropAreaProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors ${
        colSpan === 6 ? 'col-span-6' : 'col-span-12'
      } ${isOver ? 'bg-accent/50 rounded-lg' : ''}`}
    >
      {children}
    </div>
  );
}
