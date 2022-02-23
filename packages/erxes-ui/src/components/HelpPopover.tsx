import Icon from './Icon';
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

  ol {
    padding-left: 20px;
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
  trigger?: 'hover' | 'click' | 'focus';
};

class HelpPopover extends React.Component<Props> {
  renderContent() {
    const { title } = this.props;
    return (
      <Popover id="help-popover">
        <PopoverContent>
          {title && <h5>{title}</h5>}
          {this.props.children}
        </PopoverContent>
      </Popover>
    );
  }

  render() {
    const { trigger } = this.props;
    return (
      <OverlayTrigger
        trigger={trigger || 'click'}
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
