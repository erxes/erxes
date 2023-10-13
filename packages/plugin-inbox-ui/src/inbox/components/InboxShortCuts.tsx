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
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  border-bottom: 1px solid ${colors.borderDarker};

  p {
    color: ${colors.colorCoreBlack};
    margin: 0;
  }

  span {
    color: ${colors.colorCoreGray};
    margin-left: auto;
  }
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
            <p>Resolve or open conversation</p>
            <span>ctrl + x</span>
          </ShortcutItem>
          <ShortcutItem>
            <p>Assign member to conversation</p>
            <span>ctrl + a</span>
          </ShortcutItem>
          <ShortcutItem>
            <p>Activate or deactivate internal notes</p>
            <span>ctrl + i</span>
          </ShortcutItem>
          <ShortcutItem>
            <p>Tag conversation</p>
            <span>ctrl + 1</span>
          </ShortcutItem>
          <ShortcutItem>
            <p>Convert conversation</p>
            <span>ctrl + 2</span>
          </ShortcutItem>
          <ShortcutItem>
            <p>Open response template</p>
            <span>ctrl + 3</span>
          </ShortcutItem>
        </div>
      </ShortcutModal>
    );
  }
}

export default InboxShortcuts;
