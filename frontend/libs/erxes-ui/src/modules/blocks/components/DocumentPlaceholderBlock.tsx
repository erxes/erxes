import type {
  DefaultInlineContentSchema,
  DefaultStyleSchema,
} from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import type { ReactCustomBlockRenderProps } from '@blocknote/react';
import { IconFileText } from '@tabler/icons-react';
import type { FC } from 'react';

const documentPlaceholderBlockConfig = {
  type: 'documentPlaceholder' as const,
  propSchema: {
    documentId: {
      default: '',
    },
    documentName: {
      default: 'Untitled document',
    },
    documentCode: {
      default: '',
    },
    documentPreview: {
      default: '',
    },
  },
  content: 'none' as const,
  isFileBlock: false as const,
};

type DocumentPlaceholderRenderProps = ReactCustomBlockRenderProps<
  typeof documentPlaceholderBlockConfig,
  DefaultInlineContentSchema,
  DefaultStyleSchema
>;

const DocumentPlaceholderBlockContent: FC<DocumentPlaceholderRenderProps> = ({
  block,
}) => {
  const { documentId, documentName, documentCode, documentPreview } =
    block.props;
  const documentLabel = documentCode
    ? `Document placeholder - ${documentCode}`
    : 'Document placeholder';

  return (
    <div
      className="my-2 rounded-md border bg-muted/30 px-3 py-2"
      contentEditable={false}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded bg-background text-muted-foreground">
          <IconFileText size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {documentName || 'Untitled document'}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {documentId ? documentLabel : 'Select a document'}
          </div>
          {documentPreview && (
            <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {documentPreview}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DocumentPlaceholderExternalHTML: FC<
  DocumentPlaceholderRenderProps
> = ({ block }) => {
  const { documentId, documentName } = block.props;

  if (!documentId) {
    return null;
  }

  return (
    <div
      className="erxes-document-placeholder"
      data-document-id={documentId}
      data-document-name={documentName}
    >
      {`{{ document.${documentId} }}`}
    </div>
  );
};

export const documentPlaceholderBlock = createReactBlockSpec(
  documentPlaceholderBlockConfig,
  {
    render: DocumentPlaceholderBlockContent,
    toExternalHTML: DocumentPlaceholderExternalHTML,
    parse: (element) => {
      if (
        element.tagName === 'DIV' &&
        element.classList.contains('erxes-document-placeholder')
      ) {
        return {
          documentId: element.getAttribute('data-document-id') || '',
          documentName:
            element.getAttribute('data-document-name') || 'Untitled document',
          documentCode: '',
          documentPreview: '',
        };
      }

      return undefined;
    },
  },
);
