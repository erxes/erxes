import {
  IconCode,
  IconFile,
  IconH1,
  IconH2,
  IconH3,
  IconLetterT,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconMicrophone,
  IconMoodHappy,
  IconPhoto,
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
}: SuggestionMenuProps<DefaultReactSuggestionItem>) => {
  return (
    <SuggestionMenu>
      {items.map((item, index) => (
        <SuggestionMenuItem
          isSelected={selectedIndex === index}
          key={item.title}
          onClick={item.onItemClick}
        >
          <span className="flex items-center gap-2">
            {icons[item.title as keyof typeof icons]}
            {item.title}
          </span>
          <p className="text-xs font-normal text-muted-foreground">
            {item.badge?.replace(/-/g, ' ')}
          </p>
        </SuggestionMenuItem>
      ))}
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
  'Code Block': <IconCode />,
  Table: <IconTable />,
  Image: <IconPhoto />,
  Video: <IconVideo />,
  Audio: <IconMicrophone />,
  File: <IconFile />,
  Emoji: <IconMoodHappy />,
};
