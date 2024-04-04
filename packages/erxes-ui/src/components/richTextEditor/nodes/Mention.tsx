import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import {
  VariableLabel,
  VariableListBtn,
  VariableListWrapper,
  VariableWrapper,
} from '../styles';
import { FlexCenter } from '../../../styles/main';

export type SuggestionListRef = {
  // For convenience using this SuggestionList from within the
  // mentionSuggestionOptions, we'll match the signature of SuggestionOptions's
  // `onKeyDown` returned in its `render` function
  onKeyDown: NonNullable<
    ReturnType<
      NonNullable<SuggestionOptions<MentionNodeAttrs>['render']>
    >['onKeyDown']
  >;
};

// This type is based on
// https://github.com/ueberdosis/tiptap/blob/a27c35ac8f1afc9d51f235271814702bc72f1e01/packages/extension-mention/src/mention.ts#L73-L103.

// tslint:disable-next-line:interface-name
interface MentionNodeAttrs {
  id: string | null;
  label?: string | null;
  avatar?: string;
  username?: string;
  fullName?: string;
  title?: string;
}

export type SuggestionListProps = SuggestionProps<MentionNodeAttrs>;

export const MentionList = forwardRef<SuggestionListRef, SuggestionListProps>(
  ({ items = [], command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      if (index >= items.length) {
        // Make sure we actually have enough items to select the given index. For
        // instance, if a user presses "Enter" when there are no options, the index will
        // be 0 but there won't be any items, so just ignore the callback here
        return;
      }

      const item = items?.[index];

      const mentionItem = {
        id: item.id,
        label: (item.fullName || item.username || '').trim(),
      };

      if (item) {
        command(mentionItem);
      }
    };

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length);
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          upHandler();
          return true;
        }

        if (event.key === 'ArrowDown') {
          downHandler();
          return true;
        }

        if (event.key === 'Enter') {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    const renderList = () => {
      if (!items?.length) {
        return <VariableListBtn>No result</VariableListBtn>;
      }

      return items.map((item: MentionNodeAttrs, index: number) => {
        const { id, username = '', fullName = '', title = '' } = item || {};

        return (
          <VariableListBtn
            key={id}
            $focused={index === selectedIndex}
            onClick={() => selectItem(index)}
            className="mentionSuggestionsEntryContainer"
          >
            <FlexCenter>
              <div className="mentionSuggestionsEntryContainerLeft">
                <img
                  src={item.avatar || '/images/avatar-colored.svg'}
                  alt={username}
                  title={(fullName || username).trim()}
                  role="presentation"
                  className="mentionSuggestionsEntryAvatar"
                />
              </div>
              <div className="mentionSuggestionsEntryContainerRight">
                <div className="mentionSuggestionsEntryText">
                  {(fullName || username).trim()}
                </div>
                <div className="mentionSuggestionsEntryTitle">{title}</div>
              </div>
            </FlexCenter>
          </VariableListBtn>
        );
      });
    };

    return <VariableListWrapper>{renderList()}</VariableListWrapper>;
  },
);

MentionList.displayName = 'MentionList';

export function VariableComponent(props: NodeViewProps) {
  const { node, selected, updateAttributes, editor, getPos } = props;
  const { id, fallback } = node.attrs;
  const [isOpen, setIsOpen] = useState(false);
  const variableRef = useRef<HTMLDivElement>(null);

  let overLayRef: any;

  const editorPosition = editor?.view.state.selection.$from.pos;
  const variableStartPosition = getPos();
  const variableEndPosition = variableStartPosition + node.nodeSize;

  // Hack: This is hack to open popover in inline-nodes
  // otherwise it will be closed when we update the attributes
  // because the node-view will be re-rendered
  useEffect(() => {
    if (!variableRef.current || !selected) {
      return;
    }
    overLayRef.show();
    setIsOpen(true);
    // Select the text inside the variable
    const range = document.createRange();
    range.selectNode(variableRef.current);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, [selected]);

  // Hack: This is hack to close popover in inline-nodes
  // otherwise it stays open when we move the cursor outside the variable
  useEffect(() => {
    if (!overLayRef.state.show) {
      return;
    }

    if (
      editorPosition < variableStartPosition ||
      editorPosition > variableEndPosition
    ) {
      overLayRef.hide();
      return;
    }
  }, [isOpen, editorPosition, variableStartPosition, variableEndPosition]);

  return (
    <NodeViewWrapper
      draggable="false"
      style={{
        display: 'inline-block',
        lineHeight: 1,
        ...(selected ? { outline: '3px solid #555' } : {}),
      }}
    >
      <OverlayTrigger
        ref={(overlayTrigger) => {
          overLayRef = overlayTrigger;
        }}
        trigger="click"
        rootClose={true}
        placement="bottom"
        overlay={
          <Popover
            id="variable-selecting-popover-key"
            style={{ border: '1px solid #e5e7eb', padding: '1rem' }}
          >
            <VariableLabel>
              <span>Variable Name</span>
              <input
                placeholder="Add Variable Name"
                value={id}
                onChange={(e) => {
                  updateAttributes({
                    id: e.target.value,
                  });
                }}
              />
            </VariableLabel>
            <VariableLabel>
              <span>Fallback Value</span>
              <input
                placeholder="Fallback Value"
                value={fallback || ''}
                onChange={(e) => {
                  updateAttributes({
                    fallback: e.target.value,
                  });
                }}
              />
            </VariableLabel>
          </Popover>
        }
      >
        <VariableWrapper innerRef={variableRef} tabIndex={-1} itemType="button">
          {id}
        </VariableWrapper>
      </OverlayTrigger>
    </NodeViewWrapper>
  );
}
