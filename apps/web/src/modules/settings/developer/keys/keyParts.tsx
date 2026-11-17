import type { Icon } from '@tabler/icons-react';
import type { KeyDraft } from './keyDraft';

export interface DraftProps {
  draft: KeyDraft;
  onChange: (draft: KeyDraft) => void;
}

/** A choice tile's icon, title and the line under it. */
export const Choice = ({
  icon: TileIcon,
  title,
  text,
}: {
  icon: Icon;
  title: string;
  text: string;
}) => (
  <span className="flex items-start gap-3">
    <TileIcon size={20} className="mt-0.5 shrink-0" />
    <span className="flex flex-col gap-1">
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs font-normal">{text}</span>
    </span>
  </span>
);
