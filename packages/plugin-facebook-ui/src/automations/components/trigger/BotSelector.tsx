import { withProps } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';
import * as compose from 'lodash.flowright';
import { QueryResponse } from '@erxes/ui/src/types';
import {
  CollapseContent,
  ControlLabel,
  Icon,
  Spinner,
  __,
} from '@erxes/ui/src';
import { BottomBarAction } from '../../styles';
import { Avatar } from '@erxes/ui/src/components/SelectWithSearch';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../../bots/graphql';
import styled from 'styled-components';

const BotAvatar = styled(Avatar)`
  width: 50px;
  height: 50px;
  margin-right: 20px;
  border-radius: 50%;
`;

const BotCollapseContent = styled(CollapseContent)`
  border: 1px solid #e6e6e6;
`;

type Props = {
  botId: string;
  onSelect: (botId: string) => void;
};

type FinalProps = {
  botsQueryResponse: { facebootMessengerBots: any[] } & QueryResponse;
} & Props;

function BotSelector({ botId, bots, onSelect }) {
  const [selectedBotId, setBotId] = useState(botId || '');
  const [isOpen, setOpen] = useState(!botId || false);

  const selectedBot = bots.find((bot) => bot._id === selectedBotId);

  const handleSelect = (_id) => {
    setOpen(false);
    setBotId(_id);
    onSelect(_id);
  };

  return (
    <BotCollapseContent
      open={isOpen}
      transparent
      beforeTitle={
        <BotAvatar src={selectedBot?.profileUrl || '/images/erxes-bot.svg'} />
      }
      title={selectedBot?.name || 'Select a bot'}
    >
      <ControlLabel>{__('Bots List')}</ControlLabel>
      {bots.map(({ _id, profileUrl, name }) => (
        <BottomBarAction key={_id} onClick={() => handleSelect(_id)}>
          {selectedBotId === _id && <Icon icon="check-1" />}
          <Avatar src={profileUrl} alt={name} />
          {name}
        </BottomBarAction>
      ))}
    </BotCollapseContent>
  );
}

function BotSelectorContainer({ botsQueryResponse, ...props }: FinalProps) {
  const { loading, facebootMessengerBots } = botsQueryResponse;

  if (loading) {
    return <Spinner objective />;
  }

  const updatedProps = {
    ...props,
    bots: facebootMessengerBots || [],
  };

  return <BotSelector {...updatedProps} />;
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.list), {
      name: 'botsQueryResponse',
    }),
  )(BotSelectorContainer),
);
