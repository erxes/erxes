import { BlockEditor, cn, useBlockEditor } from 'erxes-ui';
import { AssignMemberInEditor, MentionInEditor } from 'ui-modules';
import type { EditorMentionItem } from 'ui-modules';

import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';

type ComposerEditorProps = {
  editor: ReturnType<typeof useBlockEditor>;
  isDiscord: boolean;
  isInternalNote: boolean;
  loading: boolean;
  discordMentionItems: EditorMentionItem[];
  discordMentionNote?: string;
  searchDiscordMentionItems: (query: string) => Promise<EditorMentionItem[]>;
  onChange: () => void;
  onFocus: (scope: InboxHotkeyScope) => void;
  onBlur: () => void;
};

export const ComposerEditor = ({
  editor,
  isDiscord,
  isInternalNote,
  loading,
  discordMentionItems,
  discordMentionNote,
  searchDiscordMentionItems,
  onChange,
  onFocus,
  onBlur,
}: ComposerEditorProps) => (
  <BlockEditor
    editor={editor}
    onChange={onChange}
    disabled={loading}
    className={cn(
      'min-h-12 w-full flex-1 overflow-y-auto',
      isInternalNote && 'internal-note',
    )}
    onFocus={() => onFocus(InboxHotkeyScope.MessageInput)}
    onBlur={onBlur}
  >
    {isInternalNote && <AssignMemberInEditor editor={editor} />}
    {isDiscord && !isInternalNote && (
      <MentionInEditor
        editor={editor}
        participants={discordMentionItems}
        searchItems={searchDiscordMentionItems}
        statusNote={discordMentionNote}
      />
    )}
  </BlockEditor>
);
