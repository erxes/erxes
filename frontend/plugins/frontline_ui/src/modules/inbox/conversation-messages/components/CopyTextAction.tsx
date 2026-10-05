import { IconCopy } from '@tabler/icons-react';
import { CopyText, DropdownMenu } from 'erxes-ui';

export const CopyTextAction = ({
  text,
  inline,
}: {
  text: string;
  inline: boolean;
}) => {
  if (inline) {
    return (
      <CopyText
        value={text}
        className="size-8 justify-center rounded-md text-muted-foreground hover:bg-muted [&>span]:gap-0 [&>span]:text-[0px]"
      >
        <IconCopy className="size-4" />
        <span className="sr-only">Copy text</span>
      </CopyText>
    );
  }
  return (
    <DropdownMenu.Item asChild className="rounded-lg">
      <CopyText value={text} className="w-full">
        <IconCopy className="size-4" />
        Copy text
      </CopyText>
    </DropdownMenu.Item>
  );
};
