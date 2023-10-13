import { colors, dimensions } from '@erxes/ui/src/styles';

import Icon from '@erxes/ui/src/components/Icon';
import { Modal } from 'react-bootstrap';
import React from 'react';
import { __ } from 'coreui/utils';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const ShortcutModal = styledTS<{ show?: boolean; onHide? }>(styled(Modal))`
  & > div {
    border-radius: 10px;
    overflow: hidden;
  }
`;

const ShortcutHeaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5em 0;
  border-bottom: 1px solid ${colors.borderDarker};

  h4 {
    margin: 10px;
  }
`;

const ShortcutItem = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: ${dimensions.unitSpacing}px;
  border-bottom: 1px solid ${colors.borderDarker};

  p {
    color: ${colors.colorCoreBlack};
    margin: 0;
    display: flex;
    align-items: center;
  }

  i {
    color: ${colors.colorCoreGray};
    margin-right: ${dimensions.unitSpacing}px;
  }

  > span {
    margin-left: auto;
    display: flex;
    align-items: flex-start;

    > span {
      margin: 0 ${dimensions.unitSpacing - 5}px;
    }
  }
`;

const ItemBlock = styled.div`
  background: ${colors.borderPrimary};
  padding: 2px 5px;
  min-width: ${dimensions.coreSpacing}px;
  text-align: center;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid ${colors.shadowPrimary};
`;

type Props = {
  shortcutModalShow: boolean;
  modalHandler: () => void;
};

class InboxShortcuts extends React.Component<Props> {
  render() {
    const { shortcutModalShow, modalHandler } = this.props;

    return (
      <ShortcutModal show={shortcutModalShow} onHide={() => modalHandler()}>
        <ShortcutHeaderWrapper>
          <h4>Help keyboard shortcuts</h4>
        </ShortcutHeaderWrapper>
        <div>
          <ShortcutItem>
            <p>
              <Icon size={16} icon="comment-check" />
              Resolve or Open conversation
            </p>
            <span>
              <ItemBlock>ctrl</ItemBlock> <span>+</span>{' '}
              <ItemBlock>x</ItemBlock>
            </span>
          </ShortcutItem>
          <ShortcutItem>
            <p>
              <Icon size={16} icon="user-plus" />
              Assign member to Conversation
            </p>
            <span>
              <ItemBlock>ctrl</ItemBlock> <span>+</span>{' '}
              <ItemBlock>a</ItemBlock>
            </span>
          </ShortcutItem>
          <ShortcutItem>
            <p>
              <Icon size={16} icon="file-bookmark-alt" />
              Activate or Deactivate internal notes
            </p>
            <span>
              <ItemBlock>ctrl</ItemBlock> <span>+</span>{' '}
              <ItemBlock>i</ItemBlock>
            </span>
          </ShortcutItem>
          <ShortcutItem>
            <p>
              <Icon size={16} icon="tag-alt" />
              Tag Conversation
            </p>
            <span>
              <ItemBlock>ctrl</ItemBlock> <span>+</span>{' '}
              <ItemBlock>1</ItemBlock>
            </span>
          </ShortcutItem>
          <ShortcutItem>
            <p>
              <Icon size={16} icon="comments" />
              Convert Conversation
            </p>
            <span>
              <ItemBlock>ctrl</ItemBlock> <span>+</span>{' '}
              <ItemBlock>2</ItemBlock>
            </span>
          </ShortcutItem>
          <ShortcutItem>
            <p>
              <Icon size={16} icon="file-landscape" />
              Open Response template
            </p>
            <span>
              <ItemBlock>ctrl</ItemBlock> <span>+</span>{' '}
              <ItemBlock>3</ItemBlock>
            </span>
          </ShortcutItem>
        </div>
      </ShortcutModal>
    );
  }
}

export default InboxShortcuts;
