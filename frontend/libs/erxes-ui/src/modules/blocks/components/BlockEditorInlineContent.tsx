import { createReactInlineContentSpec } from '@blocknote/react';
import { BarcodeAttribute } from './BarcodeAttribute';

export const Mention = createReactInlineContentSpec(
  {
    type: 'mention',
    propSchema: {
      fullName: {
        default: 'Unknown',
      },
      _id: {
        default: '',
      },
    },
    content: 'none',
  },
  {
    render: (props) => (
      <span className="bg-primary/10 p-1 rounded font-bold text-sm text-primary inline-flex items-center">
        @{props.inlineContent.props.fullName}
      </span>
    ),
  },
);

export const Attribute = createReactInlineContentSpec(
  {
    type: 'attribute',
    propSchema: {
      name: {
        default: 'Unknown',
      },
      value: {
        default: '',
      },
      width: {
        default: 150,
      },
      height: {
        default: 50,
      },
    },
    content: 'none',
  },
  {
    render: (props) =>
      props.inlineContent.props.value === 'barcode' ? (
        <BarcodeAttribute
          editable={props.editor.isEditable}
          height={props.inlineContent.props.height}
          width={props.inlineContent.props.width}
          onRemove={(element) => {
            props.editor.transact((tr) => {
              let found = false;
              tr.doc.descendants((node, position) => {
                if (found) return false;
                const dom = props.editor.prosemirrorView?.nodeDOM(position);
                if (
                  node.type.name === 'attribute' &&
                  dom instanceof HTMLElement &&
                  dom.contains(element)
                ) {
                  tr.delete(position, position + node.nodeSize);
                  found = true;
                  return false;
                }
                return true;
              });
            });
          }}
          onResize={({ width, height }) =>
            props.updateInlineContent({
              type: 'attribute',
              props: { ...props.inlineContent.props, width, height },
            })
          }
        />
      ) : (
        <span className="bg-yellow-50 p-1 rounded font-bold text-sm text-yellow-900 inline-flex items-center">
          {props.inlineContent.props.name}
        </span>
      ),
  },
);
