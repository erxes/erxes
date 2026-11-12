import {
  IconFile,
  IconH1,
  IconH2,
  IconH3,
  IconLayoutGrid,
  IconLetterT,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconMicrophone,
  IconMoodHappy,
  IconPhoto,
  IconQuote,
  IconTable,
  IconVideo,
} from '@tabler/icons-react';
import { SuggestionMenu, SuggestionMenuItem } from './SuggestionMenu';
import type { DefaultReactSuggestionItem, SuggestionMenuProps } from '@blocknote/react';

export const SlashMenu = ({
  items,
  selectedIndex,
  loadingState,
  onItemClick,
}: SuggestionMenuProps<DefaultReactSuggestionItem>) => {
  return (
    <SuggestionMenu className="max-h-72 [&>div]:max-h-[17rem]">
      {items.map((item, index) => (
        <SuggestionMenuItem
          isSelected={selectedIndex === index}
          key={item.title}
          onClick={() => onItemClick?.(item)}
        >
          <span className="flex items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0">
            {icons.get(item.title) ?? item.icon}
            {item.title}
          </span>
          <span className="text-[11px] font-normal text-muted-foreground">
            {item.badge?.replace(/-/g, ' ')}
          </span>
        </SuggestionMenuItem>
      ))}
      {loadingState !== 'loaded' && (
        <output className="block p-2 text-sm text-muted-foreground">Loading commands…</output>
      )}
      {loadingState === 'loaded' && items.length === 0 && (
        <p className="p-2 text-sm text-muted-foreground">No commands found.</p>
      )}
    </SuggestionMenu>
  );
};

// Our icons for BlockNote's default slash menu items, by item title.
const icons = new Map([
  ['Heading 1', <IconH1 key="h1" />],
  ['Heading 2', <IconH2 key="h2" />],
  ['Heading 3', <IconH3 key="h3" />],
  ['Numbered List', <IconListNumbers key="numbered-list" />],
  ['Bullet List', <IconList key="bullet-list" />],
  ['Check List', <IconListCheck key="check-list" />],
  ['Paragraph', <IconLetterT key="paragraph" />],
  ['Table', <IconTable key="table" />],
  ['Image', <IconPhoto key="image" />],
  ['Gallery', <IconLayoutGrid key="gallery" />],
  ['Video', <IconVideo key="video" />],
  ['Audio', <IconMicrophone key="audio" />],
  ['File', <IconFile key="file" />],
  ['Emoji', <IconMoodHappy key="emoji" />],
  ['Quote', <IconQuote key="quote" />],
]);
