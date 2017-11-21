import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ParticipatorWrapper,
  ParticipatorImg,
  More
} from 'modules/inbox/styles';
import { Tip } from 'modules/common/components';
import { colors } from 'modules/common/styles';

class Participators extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userLength: false
    };

    this.openParticipaters = this.openParticipaters.bind(this);
    this.hideParticipaters = this.hideParticipaters.bind(this);
  }

  openParticipaters() {
    this.setState({ userLength: true });
  }

  hideParticipaters() {
    this.setState({ userLength: false });
  }

  render() {
    const { participatedUsers, limit } = this.props;
    const { userLength } = this.state;
    const length = participatedUsers.length;

    const Trigger = user => (
      <Tip key={user._id} placement="top" text={user.details.fullName}>
        <ParticipatorImg key={user._id} src={user.details.avatar || []} />
      </Tip>
    );

    return (
      <div>
        {userLength ? (
          <ParticipatorWrapper length={length} onClick={this.hideParticipaters}>
            {participatedUsers.map(user => Trigger(user))}
          </ParticipatorWrapper>
        ) : (
          <ParticipatorWrapper length={length} onClick={this.openParticipaters}>
            {participatedUsers
              .slice(0, limit ? limit : length)
              .map(user => Trigger(user))}
            {limit &&
              length - limit > 0 && (
                <Tip placement="top" text={'View more'}>
                  <More style={{ backgroundColor: colors.colorCoreLightGray }}>
                    {`+${length - limit}`}
                  </More>
                </Tip>
              )}
          </ParticipatorWrapper>
        )}
      </div>
    );
  }
}

Participators.propTypes = {
  participatedUsers: PropTypes.array.isRequired,
  limit: PropTypes.number
};

export default Participators;
