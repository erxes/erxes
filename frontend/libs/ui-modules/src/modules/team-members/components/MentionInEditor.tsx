import {
  SuggestionMenuController,
  SuggestionMenuProps,
} from '@blocknote/react';
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
} from 'react';
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

const MentionStatusContext = createContext<string | undefined>(undefined);

export const MentionInEditor = ({
  editor,
  participants,
  emptyText = 'No participants yet',
  searchItems,
  statusNote,
}: {
  editor: IBlockEditor;
  participants: EditorMentionItem[];
  emptyText?: string;
  searchItems?: (query: string) => Promise<EditorMentionItem[]>;
  statusNote?: string;
}) => {
  const participantsRef = useRef(participants);
  const searchItemsRef = useRef(searchItems);
  const emptyTextRef = useRef(emptyText);

  useLayoutEffect(() => {
    participantsRef.current = participants;
    searchItemsRef.current = searchItems;
    emptyTextRef.current = emptyText;
  });

  const handleItemClick = useCallback(
    (item: MentionSuggestionItem) => item.onItemClick?.(),
    [],
  );

  const getItems = useCallback(
    async (query: string): Promise<MentionSuggestionItem[]> => {
      const participantList = participantsRef.current;
      const search = searchItemsRef.current;

      const trimmed = query.trim();
      const lowered = trimmed.toLowerCase();

      const localMatches = lowered
        ? participantList.filter((participant) =>
            (participant.fullName || '').toLowerCase().includes(lowered),
          )
        : participantList;

      const merged = new Map<string, EditorMentionItem>();

      for (const participant of localMatches) {
        merged.set(participant.id, participant);
      }

      if (search && lowered) {
        const remote = await search(trimmed).catch(
          () => [] as EditorMentionItem[],
        );

        for (const item of remote) {
          if (!merged.has(item.id)) {
            merged.set(item.id, item);
          }
        }
      }

      const filtered = [...merged.values()];

      if (filtered.length === 0) {
        return [
          {
            title: participantList.length
              ? 'No results found'
              : emptyTextRef.current,
            isPlaceholder: true,
          },
        ];
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
    },
    [editor],
  );

  return (
    <MentionStatusContext.Provider value={statusNote}>
      <SuggestionMenuController
        triggerCharacter="@"
        suggestionMenuComponent={MentionMenu}
        onItemClick={handleItemClick}
        getItems={getItems}
      />
    </MentionStatusContext.Provider>
  );
};

function MentionMenu(props: SuggestionMenuProps<MentionSuggestionItem>) {
  const { items, selectedIndex } = props;
  const statusNote = useContext(MentionStatusContext);
  const mentionItems = items as MentionSuggestionItem[];

  return (
    <SuggestionMenu className="hide-scroll styled-scroll *:hide-scroll *:styled-scroll">
      {mentionItems.map((entry, index) => {
        if (entry.isPlaceholder) {
          return (
            <div
              key={`placeholder-${index}`}
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
      {statusNote && (
        <div className="px-2 py-1.5 border-t text-xs text-muted-foreground">
          {statusNote}
        </div>
      )}
    </SuggestionMenu>
  );
}
