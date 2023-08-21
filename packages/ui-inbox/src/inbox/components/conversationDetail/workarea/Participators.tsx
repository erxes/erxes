import { IUser } from '@erxes/ui/src/auth/types';
import Tip from '@erxes/ui/src/components/Tip';
import { colors } from '@erxes/ui/src/styles';
import { __, getUserAvatar } from '@erxes/ui/src/utils';
import React from 'react';
import styled from 'styled-components';

const spacing = 30;

const ParticipatorWrapper = styled.div`
  margin-left: 10px;

  &:hover {
    cursor: pointer;
  }
`;

const ParticipatorImg = styled.img`
  width: ${spacing}px;
  height: ${spacing}px;
  border-radius: 15px;
  display: inline-block;
  border: 2px solid ${colors.colorWhite};
  margin-left: -10px;
`;

const More = styled(ParticipatorImg.withComponent('span'))`
  color: ${colors.colorWhite};
  text-align: center;
  vertical-align: middle;
  font-size: 10px;
  background: ${colors.colorCoreLightGray};
  line-height: ${spacing - 4}px;
`;

type Props = {
  participatedUsers: IUser[];
  limit?: number;
};

class Participators extends React.Component<Props, { toggle: boolean }> {
  state = { toggle: true };

  toggleParticipator = () => {
    this.setState({ toggle: !this.state.toggle });
  };

  render() {
    const { participatedUsers = [], limit } = this.props;
    const { toggle } = this.state;
    const length = participatedUsers.length;

    const Trigger = user => {
      const name =
        (user.details && user.details.fullName) || user.username || '';

      return (
        <Tip key={user._id} placement="bottom" text={name}>
          <ParticipatorImg
            title={`Participator: ${name}`}
            key={user._id}
            src={getUserAvatar(user)}
          />
        </Tip>
      );
    };

    const Tooltip = (
      <Tip placement="top" text={__('View more')}>
        <More>{`+${limit && length - limit}`}</More>
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

export default Participators;
