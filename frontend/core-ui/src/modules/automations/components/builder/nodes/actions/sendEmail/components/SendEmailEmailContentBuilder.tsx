import { IconEdit } from '@tabler/icons-react';
import {
  BlockEditor,
  Button,
  IBlockEditor,
  Sheet,
  useBlockEditor,
} from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { AssignMemberInEditor, AttributeInEditor } from 'ui-modules';
import { useAttributes } from 'ui-modules/modules/automations/hooks/useAttributes';
import { EmailTemplateInEditor } from './EmailTemplateInEditor';

interface SendEmailEmailContentBuilderProps {
  content: string;
  onChange: (content: string) => void;
}

export const SendEmailEmailContentBuilder = ({
  content,
  onChange,
}: SendEmailEmailContentBuilderProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const editor = useBlockEditor({});
  const isEditing = useRef(false);

  // Load content into editor when sheet opens
  useEffect(() => {
    if (!content || isEditing.current) return;

    try {
      const blocks = JSON.parse(content);
      editor.replaceBlocks(editor.document, blocks);
    } catch {
      // If not JSON, treat as plain text
      editor.replaceBlocks(editor.document, [
        {
          id: crypto.randomUUID(),
          type: 'paragraph',
          props: {
            textColor: 'default',
            backgroundColor: 'default',
            textAlignment: 'left',
          },
          content: [
            {
              type: 'text',
              text: content,
              styles: {},
            },
          ],
          children: [],
        },
      ]);
    }
  }, [content, editor]);

  // Handle editor content changes
  useEffect(() => {
    const unsubscribe = editor.onChange((editor) => {
      isEditing.current = true;
      onChange(JSON.stringify(editor.document));
      setTimeout(() => {
        isEditing.current = false;
      }, 100);
    });

    return unsubscribe;
  }, [editor, onChange]);

  return (
    <>
      <div
        className="relative border rounded-lg p-4 min-h-[120px] bg-background cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsSheetOpen(true)}
      >
        <div className="text-sm text-muted-foreground">
          <BlockEditor editor={editor} readonly className="py-8 px-4" />
        </div>

        {isHovered && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setIsSheetOpen(true);
              }}
            >
              <IconEdit className="size-4" />
              Edit Content
            </Button>
          </div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <Sheet.View className="md:w-[calc(100vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-screen-2xl">
          <Sheet.Content className="my-8">
            <BlockEditor editor={editor}>
              <SendEmailEmailContentBuilderAttributes editor={editor} />
              <EmailTemplateInEditor editor={editor} />
            </BlockEditor>
          </Sheet.Content>
        </Sheet.View>
      </Sheet>
    </>
  );
};

const SendEmailEmailContentBuilderAttributes = ({
  editor,
}: {
  editor: IBlockEditor;
}) => {
  const { attributes, loading } = useAttributes({
    contentType: 'core:users',
    attrConfig: {},
    customAttributions: [],
  });

  return (
    <AttributeInEditor
      editor={editor}
      attributes={attributes}
      loading={loading}
    />
  );
};
