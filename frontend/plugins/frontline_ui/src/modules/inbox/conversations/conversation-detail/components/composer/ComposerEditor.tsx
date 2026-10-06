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
    sideMenu={false}
    slashMenuOnTop
    className={cn(
      '[&_.bn-menu-dropdown]:max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height,50dvh))]! [&_.bn-menu-dropdown]:overflow-y-auto! [&_.bn-menu-dropdown]:overscroll-contain',
      '[&_.bn-container]:flex [&_.bn-container]:flex-col [&_.bn-formatting-toolbar]:flex-wrap',
      '[&_.bn-container>div:has(>.bn-formatting-toolbar)]:sticky! [&_.bn-container>div:has(>.bn-formatting-toolbar)]:top-0! [&_.bn-container>div:has(>.bn-formatting-toolbar)]:left-auto! [&_.bn-container>div:has(>.bn-formatting-toolbar)]:transform-none!',
      '[&_.bn-container>div:has(>.bn-formatting-toolbar)]:-order-1 [&_.bn-container>div:has(>.bn-formatting-toolbar)]:h-0 [&_.bn-container>div:has(>.bn-formatting-toolbar)]:self-center [&_.bn-container>div:has(>.bn-formatting-toolbar)]:items-start [&_.bn-container>div:has(>.bn-formatting-toolbar)]:max-w-full',
      'min-h-12 w-full [&_.bn-block-outer:has([data-content-type=image])]:hidden [&_.bn-block-outer:has([data-content-type=video])]:hidden [&_.bn-block-outer:has([data-content-type=audio])]:hidden [&_.bn-block-outer:has([data-content-type=file])]:hidden [&_.bn-block-outer:has([data-content-type=gallery])]:hidden',
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
