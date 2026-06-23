import {
  AutomationVariableBrowser,
  TAutomationVariableSourceNode,
} from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
import { useEmailDocumentPlaceholder } from '@/automations/components/common/EmailDocumentPlaceholderPicker';
import { EmailTemplateInEditor } from '@/automations/components/builder/nodes/actions/sendEmail/components/EmailTemplateInEditor';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { IconEdit } from '@tabler/icons-react';
import {
  BlockEditor,
  BlockEditorReadOnly,
  Button,
  cn,
  IBlockEditor,
  Sheet,
  useBlockEditor,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  AttributeInEditor,
  insertAutomationVariableInBlockEditor,
  TAutomationVariableDragPayload,
  useAttributes,
  useAutomationVariableBlockEditorDrop,
} from 'ui-modules';

interface SendEmailEmailContentBuilderProps {
  content: string;
  contentType: string;
  variableSourceNodes: TAutomationVariableSourceNode[];
  onChange: (content: string) => void;
}

type EmailInlineContent = {
  type?: string;
  text?: string;
  href?: string;
  content?: EmailInlineContent[];
  styles?: Record<string, unknown>;
  props?: Record<string, string>;
};

type EmailEditorBlock = {
  type?: string;
  props?: Record<string, any>;
  content?: EmailInlineContent[];
};

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const inlineStylesToCss = (styles?: Record<string, unknown>) => {
  if (!styles) {
    return '';
  }

  const css: string[] = [];

  if (styles.bold) {
    css.push('font-weight: bold');
  }

  if (styles.italic) {
    css.push('font-style: italic');
  }

  if (styles.underline) {
    css.push('text-decoration: underline');
  }

  if (styles.strike || styles.strikethrough) {
    css.push('text-decoration: line-through');
  }

  if (styles.code) {
    css.push('font-family: monospace');
    css.push('background-color: #f4f4f4');
    css.push('padding: 2px 4px');
  }

  return css.join('; ');
};

const renderInlineContent = (content?: EmailInlineContent[]): string => {
  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .map((item) => {
      if (item.type === 'attribute') {
        const value = item.props?.value || item.props?.name || '';

        return value ? `{{ ${value} }}` : '';
      }

      if (item.type === 'link') {
        return `<a href="${escapeHtml(
          item.href || '#',
        )}" style="color: #0066cc; text-decoration: underline">${renderInlineContent(
          item.content,
        )}</a>`;
      }

      const text = escapeHtml(item.text || '').replace(/\n/g, '<br />');
      const style = inlineStylesToCss(item.styles);

      return style ? `<span style="${style}">${text}</span>` : text;
    })
    .join('');
};

const renderImageBlock = (props: Record<string, any> = {}) => {
  if (!props.url) {
    return '';
  }

  const width = Math.min(Number(props.previewWidth) || 600, 600);
  const caption = props.caption
    ? `<div style="margin-top: 8px; font-size: 13px; color: #666;">${escapeHtml(
        props.caption,
      )}</div>`
    : '';

  return `<div style="margin: 16px 0;"><img src="${escapeHtml(
    props.url,
  )}" alt="${escapeHtml(
    props.caption || props.name || '',
  )}" width="${width}" style="max-width: 100%; height: auto; display: block;" />${caption}</div>`;
};

const renderEmailBlock = (block: EmailEditorBlock): string => {
  const props = block.props || {};

  switch (block.type) {
    case 'paragraph': {
      const html = renderInlineContent(block.content);

      return html ? `<p style="margin: 0 0 16px 0;">${html}</p>` : '';
    }

    case 'heading': {
      const level = Math.min(Math.max(Number(props.level) || 1, 1), 3);
      const html = renderInlineContent(block.content);

      return `<h${level} style="margin: 16px 0 8px 0;">${html}</h${level}>`;
    }

    case 'bulletListItem':
    case 'numberedListItem':
      return `<li>${renderInlineContent(block.content)}</li>`;

    case 'checkListItem': {
      const checkbox = props.checked ? '&#9745;' : '&#9744;';

      return `<p style="margin: 0 0 12px 0;">${checkbox} ${renderInlineContent(
        block.content,
      )}</p>`;
    }

    case 'image':
      return renderImageBlock(props);

    case 'documentPlaceholder':
      return props.documentId ? `{{ document.${props.documentId} }}` : '';

    default:
      return renderInlineContent(block.content);
  }
};

const renderEmailBlocks = (blocks: readonly EmailEditorBlock[]) =>
  blocks.map(renderEmailBlock).join('');

export const SendEmailEmailContentBuilder = ({
  content,
  contentType,
  variableSourceNodes,
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
        contentType={contentType}
        variableSourceNodes={variableSourceNodes}
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        editor={editor}
        onChange={onChange}
      />
    </>
  );
};

const SendEmailEmailContentBuilderEditor = ({
  contentType,
  variableSourceNodes,
  isSheetOpen,
  setIsSheetOpen,
  editor,
  onChange,
}: {
  contentType: string;
  variableSourceNodes: TAutomationVariableSourceNode[];
  editor: IBlockEditor;
  isSheetOpen: boolean;
  setIsSheetOpen: (isOpen: boolean) => void;
  onChange: (content: string) => void;
}) => {
  const { setValue } = useFormContext<TAutomationSendEmailConfig>();
  const { isDragActive, handleDragOver, handleDragLeave, handleDrop } =
    useAutomationVariableBlockEditorDrop({
      editor,
    });
  const { additionalSlashMenuItems, documentPlaceholderPicker } =
    useEmailDocumentPlaceholder({ editor });

  const convertToEmailHTML = async () => {
    return renderEmailBlocks(editor.document as readonly EmailEditorBlock[]);
  };
  const handleInsertVariable = (payload: TAutomationVariableDragPayload) => {
    insertAutomationVariableInBlockEditor({
      editor,
      payload,
    });
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
        <Sheet.Content className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)] overflow-hidden p-0">
          <aside className="min-h-0 overflow-hidden border-r bg-muted/20">
            <div className="h-full min-h-0 overflow-y-auto">
              <AutomationVariableBrowser
                sourceNodes={variableSourceNodes}
                onInsertVariable={handleInsertVariable}
                emptyState={{
                  title: 'No variables available yet',
                  description:
                    'Add a trigger or an earlier action to this automation to insert variables into the email content.',
                }}
                sourceSectionTitle="Variable Sources"
              />
            </div>
          </aside>

          <div className="min-h-0 min-w-0 overflow-y-auto bg-background p-6">
            <div
              className={cn(
                'rounded-xl border bg-background p-4 transition-colors',
                isDragActive && 'border-primary bg-primary/5',
              )}
              onDragOverCapture={handleDragOver}
              onDragLeaveCapture={handleDragLeave}
              onDropCapture={handleDrop}
            >
              <BlockEditor
                editor={editor}
                additionalSlashMenuItems={additionalSlashMenuItems}
              >
                <SendEmailEmailContentBuilderAttributes
                  contentType={contentType}
                  editor={editor}
                />
                <EmailTemplateInEditor editor={editor} />
              </BlockEditor>
              {documentPlaceholderPicker}
            </div>
          </div>
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
  contentType,
  editor,
}: {
  contentType: string;
  editor: IBlockEditor;
}) => {
  const { attributes, loading } = useAttributes({
    contentType,
    attributesConfig: {},
    additionalAttributes: [],
    attributeTypes: [],
  });

  return (
    <AttributeInEditor
      editor={editor}
      attributes={attributes}
      loading={loading}
    />
  );
};
