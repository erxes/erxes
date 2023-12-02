import React from 'react';
import {
  RichTextEditorControlBase,
  IRichTextEditorControlBaseProps
} from './RichTextEditorControl';
import { useRichTextEditorContext } from '../RichTextEditor.context';
import { FileEarmarkCode } from 'react-bootstrap-icons';

const LinkIcon: IRichTextEditorControlBaseProps['icon'] = () => (
  <FileEarmarkCode />
);

export const RichTextEditorSourceControl = () => {
  const {
    editor,
    labels,
    toggleSource,
    codeMirrorRef,
    isSourceEnabled
  } = useRichTextEditorContext();

  const handleSourceEditMode = () => {
    if (isSourceEnabled) {
      const codeText = codeMirrorRef?.current?.view?.state.doc.toString() || '';

      editor
        ?.chain()
        .focus()
        .setContent(codeText)
        .run();
    } else {
      const plainHtml = editor?.getHTML() || '';

      const viewState = codeMirrorRef?.current?.view?.state;
      codeMirrorRef?.current?.view?.dispatch({
        changes: {
          from: 0,
          to: viewState?.doc.length,
          insert: formatHtmlCode(plainHtml)
        }
      });
    }
    toggleSource();
  };

  function formatHtmlCode(htmlCode: string): string {
    try {
      // Check if the input is a string
      if (typeof htmlCode !== 'string') {
        throw new TypeError('Input must be a string');
      }

      // Use DOMParser to parse the HTML code
      const parser = new DOMParser();
      const parsedHtml = parser.parseFromString(htmlCode, 'text/html');

      // Use recursion to add proper indentation
      function addIndentation(node: Node, depth: number): string {
        const indent = '  '.repeat(depth);
        let result = '';

        if (node.nodeType === Node.ELEMENT_NODE) {
          const elementNode = node as Element; // Asserting the type to Element

          result += '\n' + indent + '<' + elementNode.tagName.toLowerCase();

          Array.from(elementNode.attributes).forEach(attr => {
            result += ` ${attr.name}="${attr.value}"`;
          });

          if (elementNode.childNodes.length === 0) {
            result += '/>';
          } else {
            result += '>';
            Array.from(elementNode.childNodes).forEach(child => {
              result += addIndentation(child, depth + 1);
            });
            result += '\n' + indent + `</${elementNode.tagName.toLowerCase()}>`;
          }
        } else if (node.nodeType === Node.TEXT_NODE) {
          result += node.nodeValue?.trim() || '';
        }

        return result;
      }

      const indentedHtml = addIndentation(parsedHtml.documentElement, 0);

      return indentedHtml;
    } catch (error) {
      return '';
    }
  }

  return (
    <RichTextEditorControlBase
      icon={LinkIcon}
      aria-label={labels.sourceControlLabel}
      title={labels.sourceControlLabel}
      active={isSourceEnabled}
      onClick={handleSourceEditMode}
      isSourceControl={true}
    />
  );
};
