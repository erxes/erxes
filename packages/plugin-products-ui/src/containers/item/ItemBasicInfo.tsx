import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import { IUser } from '@erxes/ui/src/auth/types';
import { IRouterProps } from '@erxes/ui/src/types';
import ItemBasicInfo from './../../components/item/ItemBasicInfo';
import { IItem, ItemRemoveMutationResponse } from './../../types';
import { mutations } from './../../graphql';

type Props = {
  item: IItem;
  refetchQueries?: any[];
};

type FinalProps = {
  currentUser: IUser;
} & Props &
  IRouterProps &
  ItemRemoveMutationResponse;

const BasicInfoContainer = (props: FinalProps) => {
  const { item, itemsRemove, history } = props;

  const { _id } = item;

  const remove = () => {
    itemsRemove({ variables: { Ids: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted an item');
        history.push('/settings/items');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove,
  };

  return <ItemBasicInfo {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: ['items', 'itemsTotalCount'],
});

export default withProps<Props>(
  compose(
    graphql<{}, ItemRemoveMutationResponse, { Ids: string[] }>(
      gql(mutations.itemsRemove),
      {
        name: 'itemsRemove',
        options: generateOptions,
      },
    ),
  )(withRouter<FinalProps>(BasicInfoContainer)),
);
