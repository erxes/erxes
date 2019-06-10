import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Items } from '../components/portable';
import {
  IItemParams,
  IOptions,
  ItemsQueryResponse,
  SaveMutation
} from '../types';
import { withProps } from '../utils';

type Props = {
  customerIds?: string[];
  companyIds?: string[];
  isOpen?: boolean;
  options: IOptions;
};

type FinalProps = {
  addMutation: SaveMutation;
  itemsQuery: ItemsQueryResponse;
} & Props;

class PortableItemsContainer extends React.Component<FinalProps> {
  saveItem = (doc: IItemParams, callback: () => void) => {
    const { addMutation, itemsQuery, options } = this.props;

    addMutation({ variables: doc })
      .then(() => {
        Alert.success(options.texts.addSuccessText);

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
    const { itemsQuery, options } = this.props;
    if (!itemsQuery) {
      return null;
    }

    const items = itemsQuery[options.queries.itemsQuery] || [];

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
      graphql<{}, SaveMutation, IItemParams>(
        gql(props.options.mutations.addMutation),
        {
          name: 'addMutation'
        }
      ),
      graphql<
        Props,
        ItemsQueryResponse,
        { customerIds?: string[]; companyIds?: string[] }
      >(gql(props.options.queries.itemsQuery), {
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
