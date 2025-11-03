import { IconEdit } from '@tabler/icons-react';
import {
  BlockEditor,
  BlockEditorReadOnly,
  Button,
  IBlockEditor,
  Sheet,
  useBlockEditor,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { AttributeInEditor } from 'ui-modules';
import { useAttributes } from 'ui-modules';
import { EmailTemplateInEditor } from '@/automations/components/builder/nodes/actions/sendEmail/components/EmailTemplateInEditor';
import { useFormContext } from 'react-hook-form';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';

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

  // Initialize editor with content on mount
  useEffect(() => {
    if (!content || !editor) return;

    const loadInitialContent = async () => {
      let blocks;

      try {
        blocks = JSON.parse(content);
      } catch (_error) {
        blocks = await editor.tryParseHTMLToBlocks(content);
      }
      editor.replaceBlocks(editor.document, blocks);
    };

    loadInitialContent();
  }, [editor, content]);

  return (
    <>
      <div
        className="relative border rounded-lg p-4 min-h-[120px] bg-background cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsSheetOpen(true)}
      >
        <BlockEditorReadOnly
          content={content}
          className="text-sm text-muted-foreground"
        />

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

      <SendEmailEmailContentBuilderEditor
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        editor={editor}
        onChange={onChange}
      />
    </>
  );
};

const SendEmailEmailContentBuilderEditor = ({
  isSheetOpen,
  setIsSheetOpen,
  editor,
  onChange,
}: {
  editor: IBlockEditor;
  isSheetOpen: boolean;
  setIsSheetOpen: (isOpen: boolean) => void;
  onChange: (content: string) => void;
}) => {
  const { setValue } = useFormContext<TAutomationSendEmailConfig>();
  const convertToEmailHTML = async () => {
    // Converts the editor's contents from Block objects to HTML and store to state.
    const html = await editor.blocksToFullHTML(editor.document);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Select all elements with `data-inline-content-type="attribute"`
    const attrElements = doc.querySelectorAll(
      '[data-inline-content-type="attribute"]',
    );

    attrElements.forEach((el) => {
      const value = el.getAttribute('data-value');
      if (value) {
        // Replace the element with `{{ value }}`
        const templateText = doc.createTextNode(`{{ ${value} }}`);
        el.replaceWith(templateText);
      }
    });
    return doc.body.innerHTML;
  };
  const onSave = async () => {
    onChange(JSON.stringify(editor.document));
    const html = await convertToEmailHTML();
    setValue('html', html);
    setIsSheetOpen(false);
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <Sheet.View className="md:w-[calc(100vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-screen-2xl">
        <Sheet.Header>
          <div className="space-y-1">
            <Sheet.Title>Edit Email Content</Sheet.Title>
            <Sheet.Description>
              Edit the email content for the email action.
            </Sheet.Description>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content>
          <BlockEditor editor={editor}>
            <SendEmailEmailContentBuilderAttributes editor={editor} />
            <EmailTemplateInEditor editor={editor} />
          </BlockEditor>
        </Sheet.Content>
        <Sheet.Footer>
          <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
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
