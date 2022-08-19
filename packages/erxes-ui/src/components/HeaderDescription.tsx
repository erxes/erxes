import { dimensions } from '../styles';
import { __ } from '../utils/core';
import React from 'react';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import Button from './Button';
import Tip from './Tip';
import Icon from './Icon';

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

const Description = styled.div`
  max-width: 850px;
  display: flex;
  align-items: center;
`;

export const DescImg = styled.img`
  max-width: 100px;
  max-height: 100px;
  margin-right: ${dimensions.coreSpacing}px;
`;

type Props = {
  icon: string;
  title: string;
  description: string;
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

  render() {
    const { icon, title, description } = this.props;

    return (
      <MainDescription expand={this.state.expand} onClick={this.onClick}>
        <Description>
          {this.state.expand && <DescImg src={icon} />}
          <span>
            <h4>{__(title)}</h4>
            {this.state.expand && __(description)}
          </span>
        </Description>
        <Button btnStyle="link" onClick={this.onClick}>
          <Tip
            text={__(this.state.expand ? 'Shrink' : 'Expand')}
            placement="top"
          >
            <Icon icon={this.state.expand ? 'uparrow' : 'downarrow-2'} />
          </Tip>
        </Button>
      </MainDescription>
    );
  }
}

export default HeaderDescription;
