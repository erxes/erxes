import { EmailContentEditor } from '@/emailTemplates/components/EmailContentEditor';
import { IconEdit } from '@tabler/icons-react';
import { Button, JSONContent, Sheet } from 'erxes-ui';
import { useState } from 'react';

/** The first words of the email, enough to recognise which one it is. */
const readText = (node?: JSONContent): string => {
  if (!node) {
    return '';
  }

  if (node.type === 'variable') {
    return `{${node.attrs?.id ?? ''}}`;
  }

  if (node.text) {
    return node.text;
  }

  return (node.content || []).map(readText).join(' ');
};

export const SendEmailMailyContentSheet = ({
  contentJson,
  onChange,
}: {
  contentJson?: JSONContent;
  onChange: (contentJson: JSONContent) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const teaser = readText(contentJson).trim();

  return (
    <>
      {/* The sidebar is too narrow to write an email in, so it only shows
          which email this is and opens the editor full width. */}
      <div
        className="group relative h-52 cursor-pointer overflow-hidden rounded-lg border bg-background p-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(true)}
      >
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {teaser || 'Nothing written yet'}
        </p>

        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={(event) => {
                event.stopPropagation();
                setIsOpen(true);
              }}
            >
              <IconEdit className="size-4" />
              Edit Content
            </Button>
          </div>
        )}
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <Sheet.View className="flex flex-none flex-col gap-0 overflow-hidden sm:max-w-screen-2xl md:w-[calc(100vw-theme(spacing.4))]">
          <Sheet.Header>
            <div className="space-y-1">
              <Sheet.Title>Edit Email Content</Sheet.Title>
              <Sheet.Description>
                Edit the email content for the email action.
              </Sheet.Description>
            </div>
            <Sheet.Close />
          </Sheet.Header>
          <Sheet.Content className="min-h-0 flex-1 overflow-y-auto bg-muted/40 p-6">
            <div className="mx-auto min-h-full w-full max-w-[720px] rounded-lg border bg-white">
              <EmailContentEditor
                contentJson={contentJson}
                onChange={onChange}
              />
            </div>
          </Sheet.Content>
        </Sheet.View>
      </Sheet>
    </>
  );
};
