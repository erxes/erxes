import {
  SuggestionMenuController,
  SuggestionMenuProps,
} from '@blocknote/react';
import { IBlockEditor, SuggestionMenu, SuggestionMenuItem, cn } from 'erxes-ui';

export type EditorMentionItem = {
  id: string;
  fullName: string;
  avatar?: string;
};

type MentionSuggestionItem = {
  title: string;
  item?: EditorMentionItem;
  isPlaceholder?: boolean;
  onItemClick?: () => void;
};

/**
 * Type-`@`-to-mention control for the shared BlockNote editor. Lives in
 * `ui-modules` (not the consuming remote) so importing `@blocknote/react`'s
 * `SuggestionMenuController` resolves against the host singleton — importing it
 * from inside a remote plugin breaks the editor context. Mentions are drawn from
 * the caller-provided `participants` list and inserted as the shared `mention`
 * inline node, identical to what `AssignMemberInEditor` produces.
 */
export const MentionInEditor = ({
  editor,
  participants,
  emptyText = 'No participants yet',
}: {
  editor: IBlockEditor;
  participants: EditorMentionItem[];
  emptyText?: string;
}) => {
  return (
    <SuggestionMenuController
      triggerCharacter="@"
      suggestionMenuComponent={MentionMenu}
      onItemClick={(item: MentionSuggestionItem) => item.onItemClick?.()}
      // skipcq: JS-0116 — BlockNote's getItems prop must return a Promise, so
      // `async` is required here even without an explicit await.
      getItems={async (query) => {
        if (participants.length === 0) {
          return [{ title: emptyText, isPlaceholder: true }];
        }

        const lowered = query.trim().toLowerCase();
        const filtered = lowered
          ? participants.filter((participant) =>
              (participant.fullName || '').toLowerCase().includes(lowered),
            )
          : participants;

        if (filtered.length === 0) {
          return [{ title: 'No results found', isPlaceholder: true }];
        }

        return filtered.map((participant) => ({
          title: participant.fullName || 'Unknown',
          item: participant,
          onItemClick: () => {
            editor.suggestionMenus.clearQuery();
            editor.suggestionMenus.closeMenu();

            editor.insertInlineContent([
              {
                type: 'mention',
                props: {
                  fullName: participant.fullName || 'Unknown',
                  _id: participant.id,
                },
              },
              ' ',
            ]);
          },
        }));
      }}
    />
  );
};

/** Renders the `@`-mention suggestion list (or a placeholder row). */
function MentionMenu(props: SuggestionMenuProps<MentionSuggestionItem>) {
  const { items, selectedIndex } = props;
  const mentionItems = items as MentionSuggestionItem[];

  return (
    <SuggestionMenu className="hide-scroll styled-scroll *:hide-scroll *:styled-scroll">
      {mentionItems.map((entry, index) => {
        if (entry.isPlaceholder) {
          return (
            <div
              key="placeholder"
              className="p-2 text-muted-foreground italic cursor-default"
            >
              {entry.title}
            </div>
          );
        }

        return (
          <SuggestionMenuItem
            key={entry.item?.id ?? index}
            isSelected={selectedIndex === index}
            className="justify-start gap-2"
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
              event.preventDefault();
              event.stopPropagation();
              entry.onItemClick?.();
            }}
          >
            {entry.item?.avatar ? (
              // skipcq: JS-W1015
              <img
                src={entry.item.avatar}
                alt=""
                className="size-5 rounded-full object-cover"
              />
            ) : (
              <span
                className={cn(
                  'size-5 rounded-full bg-primary/10 text-primary',
                  'text-xs flex items-center justify-center',
                )}
              >
                {(entry.title || '?').charAt(0).toUpperCase()}
              </span>
            )}
            <span className="truncate">@{entry.title}</span>
          </SuggestionMenuItem>
        );
      })}
    </SuggestionMenu>
  );
}
