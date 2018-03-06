import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Tip } from 'modules/common/components';
import { colors } from 'modules/common/styles';

const Spacing = 30;

const ParticipatorWrapper = styled.div`
  display: inline-block;
  margin-left: ${Spacing}px;

  &:hover {
    cursor: pointer;
  }
`;

const ParticipatorImg = styled.img`
  width: ${Spacing}px;
  height: ${Spacing}px;
  border-radius: 15px;
  display: inline-block;
  border: 2px solid ${colors.colorWhite};
  margin-left: -10px;
`;

const More = ParticipatorImg.withComponent('span').extend`
  color: ${colors.colorWhite};
  text-align: center;
  vertical-align: middle;
  font-size: 10px;
  background: ${colors.colorCoreLightGray};
  line-height: ${Spacing - 2}px;
`;

class Participators extends Component {
  constructor(props) {
    super(props);

    this.state = {
      toggle: true
    };

    this.toggleParticipator = this.toggleParticipator.bind(this);
  }

  toggleParticipator() {
    this.setState({ toggle: !this.state.toggle });
  }

  render() {
    const { participatedUsers, limit } = this.props;
    const { toggle } = this.state;
    const length = participatedUsers.length;
    const { __ } = this.context;

    const Trigger = user => (
      <Tip key={user._id} placement="top" text={user.details.fullName || ''}>
        <ParticipatorImg
          key={user._id}
          src={user.details.avatar || '/images/avatar-colored.svg'}
        />
      </Tip>
    );

    const Tooltip = (
      <Tip placement="top" text={__('View more')}>
        <More>{`+${length - limit}`}</More>
      </Tip>
    );

    return (
      <ParticipatorWrapper onClick={this.toggleParticipator}>
        {participatedUsers
          .slice(0, limit && toggle ? limit : length)
          .map(user => Trigger(user))}
        {limit && toggle && length - limit > 0 && Tooltip}
      </ParticipatorWrapper>
    );
  }
}

Participators.propTypes = {
  participatedUsers: PropTypes.array.isRequired,
  limit: PropTypes.number
};

Participators.contextTypes = {
  __: PropTypes.func
};

export default Participators;
