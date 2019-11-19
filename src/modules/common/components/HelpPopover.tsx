import Icon from 'modules/common/components/Icon';
import * as React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import styled from 'styled-components';
import { colors, dimensions } from '../styles';

const PopoverContent = styled.div`
  padding: ${dimensions.coreSpacing}px;
  line-height: 24px;
  h5 {
    margin-top: 0;
    line-height: 20px;
  }
`;

const IconClass = styled.div`
  display: inline-block;
  cursor: pointer;
  margin-left: 5px;
  font-size: 16px;
  color: ${colors.colorCoreRed};
`;

type Props = {
  title?: string;
};

class HelpPopover extends React.Component<Props> {
  renderContent() {
    return (
      <Popover id="main-popover">
        <PopoverContent>
          <h5>{this.props.title}</h5>
          {this.props.children}
        </PopoverContent>
      </Popover>
    );
  }

  render() {
    return (
      <OverlayTrigger
        trigger="click"
        placement="auto"
        overlay={this.renderContent()}
        rootClose={true}
      >
        <IconClass>
          <Icon icon="question-circle" />
        </IconClass>
      </OverlayTrigger>
    );
  }
}

export default HelpPopover;
