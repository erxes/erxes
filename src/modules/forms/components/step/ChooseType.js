import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FlexItem } from './style';
import styled from 'styled-components';
import { dimensions, colors } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const BoxContainer = styled.div`
  align-self: center;
  min-width: 450px;
  padding: ${dimensions.coreSpacing}px;
`;

const Preview = styled.div`
  flex: 1;
  background: ${colors.bgMain};
  padding: ${dimensions.coreSpacing}px;
`;

const Box = styled.div`
  display: inline-block;
  text-align: center;
  background: ${colors.colorLightBlue};
  box-shadow: 0 5px 5px ${rgba(colors.colorCoreGray, 0.08)};
  border: 1px solid
    ${props => (props.selected ? colors.colorPrimary : colors.borderPrimary)};
  border-radius: ${dimensions.unitSpacing / 2}px;
  padding: ${dimensions.headerSpacing - 5}px;
  transition: all 0.25s ease;
  width: 200px;
  margin-right: 20px;

  img {
    width: 75px;
    transition: all 0.5s ease;
  }

  span {
    color: ${colors.colorCoreGray};
    display: block;
    margin-top: ${dimensions.unitSpacing}px;
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)};

    img {
      transform: scale(1.1);
    }
  }
`;

const propTypes = {
  kind: PropTypes.string,
  changeState: PropTypes.func
};

class ChooseType extends Component {
  renderBox(name, image, value) {
    return (
      <Box
        selected={this.props.kind === value}
        onClick={() => this.changeState(value)}
      >
        <img src={image} alt={name} />
        <span>{name}</span>
      </Box>
    );
  }

  changeState(value) {
    if (value === 'shoutbox') {
      this.props.changeState('kind', 'shoutbox');
    } else if (value === 'popup') {
      this.props.changeState('kind', 'popup');
    }
    this.props.changeState('kind', value);
  }

  renderPreview() {
    const { kind } = this.props;

    if (kind === 'shoutbox') {
      return 'zurag1';
    } else if (kind === 'popup') {
      return 'zurag2';
    }
    return 'zruag3';
  }

  render() {
    return (
      <FlexItem>
        <BoxContainer>
          {this.renderBox('ShoutBox', '/images/icons/erxes-07.svg', 'shoutbox')}
          {this.renderBox('Popup', '/images/icons/erxes-08.svg', 'popup')}
          {this.renderBox('Embedded', '/images/icons/erxes-08.svg', 'embedded')}
        </BoxContainer>
        <Preview>{this.renderPreview()}</Preview>
      </FlexItem>
    );
  }
}

ChooseType.propTypes = propTypes;

export default ChooseType;
