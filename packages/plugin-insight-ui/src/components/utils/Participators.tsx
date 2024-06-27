import React, { useState } from "react";

import { IUser } from "@erxes/ui/src/auth/types";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils/index";
import { colors } from "@erxes/ui/src/styles";
import { getUserAvatar } from "@erxes/ui/src/utils/index";
import styled from "styled-components";
import { Flex } from "@erxes/ui/src/styles/main";

const spacing = 30;

const ParticipatorWrapper = styled.div`
  margin-left: 10px;
  display: flex;

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

const More = styled(ParticipatorImg).attrs({
  as: "span",
})`
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

const Participators = (props: Props) => {
  const { participatedUsers = [], limit } = props;

  const length = participatedUsers.length;

  const Trigger = (user) => {
    const name =
      (user.details && user.details.fullName) || user.username || user.email;

    return (
      <Tip placement="top" text={name}>
        <Flex>
          <ParticipatorImg key={user._id} src={getUserAvatar(user)} />
        </Flex>
      </Tip>
    );
  };

  const Tooltip = (
    <Tip placement="top" text={__("View more")}>
      <More>{`+${limit && length - limit}`}</More>
    </Tip>
  );

  return (
    <ParticipatorWrapper>
      {participatedUsers
        .slice(0, limit ? limit : length)
        .map((user) => Trigger(user))}
      {limit && length - limit > 0 && Tooltip}
    </ParticipatorWrapper>
  );
};

export default Participators;
