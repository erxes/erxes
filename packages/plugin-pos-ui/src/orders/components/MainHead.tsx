import React from 'react';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { __, dimensions, Button, Tip, Icon, ControlLabel } from '@erxes/ui/src';
import { IOrdersSummary } from '../../types';

const MainDescription = styledTS<{
  expand: boolean;
}>(styled.div)`
  width: 100%;
  padding: 30px 10px 30px;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  font-size: 12px;
  position: relative;
  cursor: pointer;

  ${props => css`
    height: ${props.expand === false && '0px'};
  `}

  h4 {
    margin: 0;
    padding-bottom: 5px;
    font-size: 18px;
    font-weight: 500;
  }
`;

const ActionBar = styledTS<{
  expand: boolean;
}>(styled.div)`
  margin-top: ${props => (props.expand ? '-72px' : '')};
  text-align: right;
`;

const Description = styled.div`
  max-width: 1000px;
  display: flex;
  align-items: center;
`;

const DescImg = styled.img`
  max-width: 100px;
  max-height: 100px;
  margin-right: ${dimensions.coreSpacing}px;
`;

const Amount = styled.ul`
  display: flex;
  padding-left: 0px;
`;

const HeaderContentSmall = styled.div`
  text-align: right;
  margin-left: 15px;
  min-width: 150px;
  flex-shrink: 0;
  p {
    font-size: 16px;
    margin-bottom: 5px;
    font-weight: bold;
  }
  label {
    margin-right: 0;
  }
  input.form-control {
    box-shadow: none;
    border-radius: 0;
    border: none;
    background: none;
    text-align: right;
    border: none !important;
    padding: 0 !important;
    height: 20px;
    width: 150px;
    &:focus {
      box-shadow: none;
    }
  }
`;

type Props = {
  icon: string;
  title: string;
  summary: any;
  actionBar: React.ReactNode;
};

type State = {
  expand: boolean;
};

class HeaderDescription extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);

    const localExpand = localStorage.getItem('expand');
    this.state = {
      expand: localExpand ? localExpand === 'true' : true
    };
  }

  onClick = () => {
    this.setState({ expand: !this.state.expand }, () => {
      localStorage.setItem('expand', this.state.expand.toString());
    });
  };

  onClickSkip = e => {
    e.stopPropagation();
  };

  renderAmount = (amount = {}, order) => {
    if (Object.keys(amount).length === 0) {
      return null;
    }

    return (
      <Amount>
        {order.map(key => {
          if (!Object.keys(amount).includes(key)) {
            return '';
          }

          return (
            <HeaderContentSmall key={key}>
              <ControlLabel>{__(key)}</ControlLabel>
              <p>{amount[key].toLocaleString()}</p>
            </HeaderContentSmall>
          );
        })}
      </Amount>
    );
  };

  renderSummary(summary: IOrdersSummary) {
    if (!this.state.expand) {
      return '';
    }

    return (
      <>
        {this.renderAmount(summary, [
          'cashAmount',
          'receivableAmount',
          'cardAmount',
          'mobileAmount',
          'totalAmount',
          'count'
        ])}
      </>
    );
  }

  render() {
    const { icon, title, summary, actionBar } = this.props;

    return (
      <>
        <MainDescription expand={this.state.expand} onClick={this.onClick}>
          <Description>
            {this.state.expand && <DescImg src={icon} />}

            <h4>{__(title)}</h4>
            {this.renderSummary(summary)}
          </Description>
          <Button btnStyle="link" onClick={this.onClick}>
            <Tip
              text={__(this.state.expand ? 'Shrink' : 'Expand')}
              placement="top"
            >
              <Icon icon={this.state.expand ? 'uparrow' : 'downarrow-2'} />
            </Tip>
          </Button>
          <ActionBar expand={this.state.expand} onClick={this.onClickSkip}>
            {actionBar}
          </ActionBar>
        </MainDescription>
      </>
    );
  }
}

export default HeaderDescription;
