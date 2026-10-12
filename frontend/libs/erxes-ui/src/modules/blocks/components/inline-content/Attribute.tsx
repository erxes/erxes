import { createReactInlineContentSpec } from '@blocknote/react';
import { BarcodeAttribute } from './BarcodeAttribute';

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
