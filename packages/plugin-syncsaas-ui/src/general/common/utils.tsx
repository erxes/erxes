import { dimensions, ControlLabel, Button, __, colors } from '@erxes/ui/src';
import React from 'react';
import { Placement } from 'react-bootstrap/Overlay';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import styled from 'styled-components';
import { FormContainer } from '../../styles';
import { ModalFooter } from '@erxes/ui/src/styles/main';

type Props = {
  title?: string;
  withoutPopoverTitle?: boolean;
  icon?: string;
  iconColor?: string;
  customComponent?: JSX.Element;
  placement?: Placement;
  rootClose?: boolean;
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
      <Popover id="help-popover" style={{ zIndex: 1050 }}>
        <PopoverContent>
          {!withoutPopoverTitle && title && <h5>{title}</h5>}
          {this.props.children}
        </PopoverContent>
      </Popover>
    );
  }

  renderContent() {
    const { customComponent, title, icon, iconColor } = this.props;
    if (customComponent) {
      return customComponent;
    }

    return (
      <>
        {title && (
          <div>
            <ControlLabel>{__(title)}</ControlLabel>
          </div>
        )}
        <div>
          <Button
            style={{ padding: '7px 0' }}
            btnStyle="link"
            iconColor={iconColor}
            icon={icon ? icon : 'question-circle'}
          ></Button>
        </div>
      </>
    );
  }

  render() {
    const { rootClose = true } = this.props;

    return (
      <OverlayTrigger
        trigger={'click'}
        placement={this.props.placement || 'auto'}
        overlay={this.renderOverlay()}
        rootClose={rootClose}
      >
        <FormContainer row flex gapBetween={5} align="center">
          {this.renderContent()}
        </FormContainer>
      </OverlayTrigger>
    );
  }
}

const THeadContainer = styled.div`
  display: flex;
  gap: 5px;
  margin-inline-start: auto;
  align-items: center;
`;

const ActionBar = styled(ModalFooter)`
  margin-top: 0px;
`;

type TableHeadProps = {
  children: any;
  filter?: any;
  sort?: any;
};

export function TableHead({ children, filter, sort }: TableHeadProps) {
  return (
    <th>
      <THeadContainer>
        {sort && sort}
        {children}
        {filter && (
          <DetailPopOver
            title=""
            withoutPopoverTitle
            icon="filter-1"
            iconColor={filter?.actionBar && colors.colorCoreBlue}
          >
            <ActionBar>{filter?.actionBar}</ActionBar>
            {filter?.main}
          </DetailPopOver>
        )}
      </THeadContainer>
    </th>
  );
}
