import { useDraggable } from '@dnd-kit/core';
import { Avatar, cn, readImage } from 'erxes-ui';
import { KeyboardEvent } from 'react';
import { IStructureDragPerson } from '../../utils/structureDrop';

export const StructurePersonAvatar = ({
  person,
  size = 'lg',
}: {
  person: Pick<IStructureDragPerson, 'name' | 'avatar'>;
  size?: 'lg' | 'xl';
}) => (
  <Avatar size={size}>
    <Avatar.Image src={readImage(person.avatar ?? '')} />
    <Avatar.Fallback>{person.name.charAt(0).toUpperCase()}</Avatar.Fallback>
  </Avatar>
);

export const StructurePersonChip = ({
  dragId,
  person,
  disabled,
  className,
  onClick,
}: {
  dragId: string;
  person: IStructureDragPerson;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}) => {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: dragId,
    data: { item: { kind: 'person', person } },
    disabled,
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (onClick && event.key === 'Enter') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <span
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      title={person.name}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'nodrag nopan inline-flex min-w-0 items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring',
        (!disabled || onClick) && 'hover:bg-accent',
        !disabled && 'cursor-grab active:cursor-grabbing',
        disabled && onClick && 'cursor-pointer',
        isDragging && 'opacity-40',
        className,
      )}
    >
      <StructurePersonAvatar person={person} />
      <span className="truncate">{person.name}</span>
    </span>
  );
};
