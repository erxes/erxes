import React from 'react';
import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../../bots/graphql';
import { withProps } from '@erxes/ui/src/utils/core';
import { QueryResponse } from '@erxes/ui/src/types';
import FormControl from '@erxes/ui/src/components/form/Control';
import Spinner from '@erxes/ui/src/components/Spinner';
import { ListItem } from '../../styles';
import colors from '@erxes/ui/src/styles/colors';

type Props = {
  botId?: string;
  onChange: (name: string, value: any) => void;
  persistentMenuIds?: string[];
};

type FinalProps = {
  botQueryResponse: { facebootMessengerBot: any } & QueryResponse;
} & Props;

function PersistenceMenuSelector({
  botQueryResponse,
  persistentMenuIds = [],
  onChange,
}: FinalProps) {
  const { facebootMessengerBot, loading } = botQueryResponse || {};

  if (loading) {
    return <Spinner objective />;
  }

  const { persistentMenus = [] } = facebootMessengerBot || {};

  const onCheck = (_id) => {
    const updatedMenuIds = persistentMenuIds.includes(_id)
      ? persistentMenuIds.filter((id) => id !== _id)
      : [...persistentMenuIds, _id];

    console.log({ _id, updatedMenuIds });
    onChange('persistentMenuIds', updatedMenuIds);
  };

  return persistentMenus.map(
    ({ _id, text, type }) =>
      type !== 'link' && (
        <ListItem key={_id}>
          <FormControl
            componentClass="radio"
            color={colors.colorCoreBlue}
            checked={persistentMenuIds?.includes(_id)}
            onClick={() => onCheck(_id)}
          />
          <span>{text}</span>
        </ListItem>
      ),
  );
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.detail), {
      name: 'botQueryResponse',
      options: ({ botId }) => ({
        variables: { _id: botId },
      }),
      skip: ({ botId }) => !botId,
    }),
  )(PersistenceMenuSelector),
);
