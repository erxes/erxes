import { __, getUserAvatar } from '@erxes/ui/src/utils';

import { IUser } from '@erxes/ui/src/auth/types';
import React, { useState } from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { colors } from '@erxes/ui/src/styles';
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

const More = styled(styled.span(ParticipatorImg as any))`
  color: ${colors.colorWhite};
  text-align: center;
  vertical-align: middle;
  font-size: 10px;
  background: ${colors.colorCoreLightGray};
  line-height: ${spacing - 4}px;
`;

type Props = {
  participatedUsers?: IUser[];
  limit?: number;
};

const Participators: React.FC<Props> = (props) => {
  const [toggle, setToggle] = useState(true);

  const toggleParticipator = () => {
    setToggle(!toggle);
  };

  const { participatedUsers = [], limit } = props;
  const length = participatedUsers.length;

  const Trigger = (user) => {
    const name = (user.details && user.details.fullName) || user.username || '';

    return (
      <Tip key={user._id} placement="bottom" text={name}>
        <ParticipatorImg
          title={__(`Participator: ${name}`)}
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
    <ParticipatorWrapper onClick={toggleParticipator}>
      {participatedUsers
        .slice(0, limit && toggle ? limit : length)
        .map((user) => Trigger(user))}
      {limit && toggle && length - limit > 0 && Tooltip}
    </ParticipatorWrapper>
  );
};

export default Participators;
