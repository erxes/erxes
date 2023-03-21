import { Button, ControlLabel, dimensions, __ } from '@erxes/ui/src';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import styled from 'styled-components';
import { FormContainer } from '../../styles';

type Props = {
  title: string;
  withoutPopoverTitle?: boolean;
  icon?: string;
  customComponent?: JSX.Element;
};

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

export class DetailPopOver extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderOverlay() {
    const { title, withoutPopoverTitle } = this.props;
    return (
      <Popover id="help-popover">
        <PopoverContent>
          {!withoutPopoverTitle && title && <h5>{title}</h5>}
          {this.props.children}
        </PopoverContent>
      </Popover>
    );
  }

  renderContent() {
    const { customComponent, title, icon } = this.props;
    if (customComponent) {
      return customComponent;
    }

    return (
      <>
        <div>
          <ControlLabel>{__(title)}</ControlLabel>
        </div>
        <div>
          <Button
            style={{ padding: '7px 0' }}
            btnStyle="link"
            icon={icon ? icon : 'question-circle'}
          ></Button>
        </div>
      </>
    );
  }

  render() {
    return (
      <OverlayTrigger
        trigger={'click'}
        placement="auto"
        overlay={this.renderOverlay()}
        rootClose={true}
      >
        <FormContainer row flex gapBetween={5} align="center">
          {this.renderContent()}
        </FormContainer>
      </OverlayTrigger>
    );
  }
}
