import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FlexItem, Divider } from './style';
import styled from 'styled-components';
import { dimensions, colors } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const BoxContainer = FlexItem.extend`
  min-width: 500px;
  padding: 0 20px;
  > div {
    max-height: 100%;
    width: 420px;
  }
`;

const Preview = FlexItem.extend`
  flex: 1 100%;
`;

const Box = styled.div`
  display: inline-block;
  text-align: center;
  background: ${colors.colorLightBlue};
  box-shadow: 0 8px 5px ${rgba(colors.colorCoreGray, 0.08)};
  border-radius: ${dimensions.unitSpacing / 2}px;
  transition: all 0.25s ease;
  width: 200px;
  height: 200px;
  padding: 20px;
  margin-top: 20px;
  vertical-align: top;

  &:nth-child(2n) {
    margin-left: 20px;
  }

  &:last-child {
    margin-bottom: 20px;
  }

  img {
    width: 75px;
    transition: all 0.5s ease;
  }

  span {
    color: ${colors.colorCoreGray};
    display: block;
    margin-top: ${dimensions.unitSpacing}px;
    text-transform: capitalize;
    font-weight: 500;
  }

  p {
    margin: 10px 0 0;
    font-size: 12px;
    color: ${colors.colorCoreLightGray};
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)};

    img {
      transform: scale(1.1);
    }
  }

  @media (max-width: 780px) {
    width: 100%;
  }

  ${props => {
    if (props.selected) {
      return `
        box-shadow: 0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)};
        img {
          transform: scale(1.1);
        }
      `;
    }
  }};
`;
const Img = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${props => (props.src ? props.src : '')});
  background-size: ${props => (props.size ? props.size : 'cover')};
  background-repeat: no-repeat;
  background-position: ${props =>
    props.position ? props.position : 'right bottom'};
`;

const propTypes = {
  changeState: PropTypes.func,
  kind: PropTypes.string
};

const contextTypes = {
  __: PropTypes.func
};

class ChannelStep extends Component {
  renderBox(name, image, desc, value) {
    const { __ } = this.context;
    return (
      <Box
        selected={this.props.kind === value}
        onClick={() => this.changeState(value)}
      >
        <img src={image} alt={name} />
        <span>{__(name)}</span>
        <p>{__(desc)}</p>
      </Box>
    );
  }

  changeState(value) {
    if (value === 'manual') {
      this.props.changeState('method', 'email');
    } else {
      this.props.changeState('method', 'messenger');
    }
    this.props.changeState('kind', value);
  }

  renderPreview() {
    const { kind } = this.props;

    if (kind === 'auto') {
      return <Img src="/images/engage/auto.jpg" />;
    } else if (kind === 'manual') {
      return (
        <Img
          src="/images/engage/email.jpg"
          size="contain"
          position="center center"
        />
      );
    }
    return <Img src="/images/engage/visitor.jpg" />;
  }

  render() {
    return (
      <FlexItem>
        <BoxContainer v="center" h="center" overflow="auto">
          <div>
            {this.renderBox(
              'Auto message',
              '/images/icons/erxes-07.svg',
              'Delivered to a user s email inbox Customize with your own templates',
              'auto'
            )}
            {this.renderBox(
              'Email marketing',
              '/images/icons/erxes-08.svg',
              'Delivered inside your app Reach active users',
              'manual'
            )}
            {this.renderBox(
              'Visitor message',
              '/images/icons/erxes-08.svg',
              'Delivered inside your app Reach active users',
              'visitorAuto'
            )}
          </div>
        </BoxContainer>
        <Divider />
        <Preview>{this.renderPreview()}</Preview>
      </FlexItem>
    );
  }
}

ChannelStep.propTypes = propTypes;
ChannelStep.contextTypes = contextTypes;

export default ChannelStep;
