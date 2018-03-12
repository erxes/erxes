import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { EmbeddedPreview, PopupPreview, ShoutboxPreview } from './preview';
import { dimensions, colors } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import { FlexItem, LeftItem, Preview, Title } from './style';

const Box = styled.div`
  display: inline-block;
  text-align: center;
  background: ${colors.colorLightBlue};
  box-shadow: 0 5px 5px ${rgba(colors.colorCoreGray, 0.08)};
  border: 1px solid
    ${props =>
      props.selected ? colors.colorPrimaryDark : colors.borderPrimary};
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
  constructor(props) {
    super(props);

    this.state = {
      title: 'Contact',
      bodyValue: 'Body description here',
      btnText: 'Send',
      color: '#04A9F5'
    };
  }

  renderBox(name, image, value) {
    const { __ } = this.context;
    return (
      <Box
        selected={this.props.kind === value}
        onClick={() => this.changeState(value)}
      >
        <img src={image} alt={name} />
        <span>{__(name)}</span>
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
    const { title, bodyValue, btnText, color } = this.state;

    if (kind === 'shoutbox') {
      return (
        <ShoutboxPreview
          title={title}
          bodyValue={bodyValue}
          btnText={btnText}
          color={color}
        />
      );
    } else if (kind === 'popup') {
      return (
        <PopupPreview
          title={title}
          bodyValue={bodyValue}
          btnText={btnText}
          color={color}
        />
      );
    }
    return (
      <EmbeddedPreview
        title={title}
        bodyValue={bodyValue}
        btnText={btnText}
        color={color}
      />
    );
  }

  render() {
    const { __ } = this.context;
    return (
      <FlexItem>
        <LeftItem>
          <Title>{__('Choose a flow type')}</Title>
          {this.renderBox('ShoutBox', '/images/icons/erxes-07.svg', 'shoutbox')}
          {this.renderBox('Popup', '/images/icons/erxes-08.svg', 'popup')}
          {this.renderBox('Embedded', '/images/icons/erxes-08.svg', 'embedded')}
        </LeftItem>
        <Preview>{this.renderPreview()}</Preview>
      </FlexItem>
    );
  }
}

ChooseType.propTypes = propTypes;
ChooseType.contextTypes = {
  __: PropTypes.func
};

export default ChooseType;
