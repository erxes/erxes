import {
  IconCode,
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
import {
  DefaultReactSuggestionItem,
  SuggestionMenuProps,
} from '@blocknote/react';

export const SlashMenu = ({
  items,
  selectedIndex,
  onItemClick,
}: SuggestionMenuProps<DefaultReactSuggestionItem>) => {
  return (
    <SuggestionMenu className="max-h-80 [&>div]:max-h-72">
      {items.map((item, index) => (
        <SuggestionMenuItem
          isSelected={selectedIndex === index}
          key={item.title}
          onClick={() => onItemClick?.(item)}
a        >
          <span className="flex items-center gap-2">
            {icons[item.title as keyof typeof icons] ?? item.icon}
            {item.title}
          </span>
          <p className="text-xs font-normal text-muted-foreground">
            {item.badge?.replace(/-/g, ' ')}
          </p>
        </SuggestionMenuItem>
      ))}
      {loadingState !== 'loaded' && (
        <p role="status" className="p-2 text-sm text-muted-foreground">
          Loading commands…
        </p>
      )}
      {loadingState === 'loaded' && items.length === 0 && (
        <p className="p-2 text-sm text-muted-foreground">No commands found.</p>
      )}
    </SuggestionMenu>
  );
};

const icons = {
  'Heading 1': <IconH1 />,
  'Heading 2': <IconH2 />,
  'Heading 3': <IconH3 />,
  'Numbered List': <IconListNumbers />,
  'Bullet List': <IconList />,
  'Check List': <IconListCheck />,
  Paragraph: <IconLetterT />,
  Table: <IconTable />,
  Image: <IconPhoto />,
  Gallery: <IconLayoutGrid />,
  Video: <IconVideo />,
  Audio: <IconMicrophone />,
  File: <IconFile />,
  Emoji: <IconMoodHappy />,
  Quote: <IconQuote />,
};
