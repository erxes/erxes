import type { KeyDraft } from './keyDraft';

export interface DraftProps {
  draft: KeyDraft;
  onChange: (draft: KeyDraft) => void;
}

/** A choice tile's title and the line under it. */
export const Choice = ({ title, text }: { title: string; text: string }) => (
  <span className="flex flex-col gap-1">
    <span className="text-sm font-semibold">{title}</span>
    <span className="text-xs font-normal">{text}</span>
  </span>
);
