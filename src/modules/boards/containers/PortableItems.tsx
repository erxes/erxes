import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Items } from '../components/portable';
import { STAGE_CONSTANTS } from '../constants';
import { mutations, queries } from '../graphql';
import { ItemParams, ItemsQueryResponse, SaveMutation } from '../types';
import { withProps } from '../utils';

type Props = {
  customerIds?: string[];
  companyIds?: string[];
  isOpen?: boolean;
  type: string;
};

type FinalProps = {
  addMutation: SaveMutation;
  itemsQuery: ItemsQueryResponse;
} & Props;

class PortableItemsContainer extends React.Component<FinalProps> {
  saveItem = (doc: ItemParams, callback: () => void) => {
    const { addMutation, itemsQuery, type } = this.props;

    addMutation({ variables: doc })
      .then(() => {
        Alert.success(STAGE_CONSTANTS[type].addSuccessText);

        callback();

        itemsQuery.refetch();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  onChangeItems = () => {
    const { itemsQuery } = this.props;

    itemsQuery.refetch();
  };

  render() {
    const { itemsQuery, type } = this.props;
    if (!itemsQuery) {
      return null;
    }

    const items = itemsQuery[STAGE_CONSTANTS[type].itemsQuery] || [];

    const extendedProps = {
      ...this.props,
      items,
      saveItem: this.saveItem,
      onChangeItems: this.onChangeItems
    };

    return <Items {...extendedProps} />;
  }
}

export default (props: Props) =>
  withProps<Props>(
    props,
    compose(
      // mutation
      graphql<{}, SaveMutation, ItemParams>(
        gql(mutations[STAGE_CONSTANTS[props.type].addMutation]),
        {
          name: 'addMutation'
        }
      ),
      graphql<
        Props,
        ItemsQueryResponse,
        { customerIds?: string[]; companyIds?: string[] }
      >(gql(queries[STAGE_CONSTANTS[props.type].itemsQuery]), {
        name: 'itemsQuery',
        skip: ({ customerIds, companyIds }) => !customerIds && !companyIds,
        options: ({ customerIds, companyIds }) => ({
          variables: {
            customerIds,
            companyIds
          }
        })
      })
    )(PortableItemsContainer)
  );
