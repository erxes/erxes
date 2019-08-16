import gql from 'graphql-tag';
import { renderWithProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import Items from '../../components/portable/Items';
import { IOptions, ItemsQueryResponse } from '../../types';

type IProps = {
  mainType?: string;
  mainTypeIds?: string[];
  isOpen?: boolean;
  options: IOptions;
};

type FinalProps = {
  itemsQuery: ItemsQueryResponse;
} & IProps;

class PortableItemsContainer extends React.Component<FinalProps> {
  onChangeItems = () => {
    const { itemsQuery } = this.props;

    itemsQuery.refetch();
  };

  render() {
    const { itemsQuery, options, mainType, mainTypeIds } = this.props;

    if (!itemsQuery) {
      return null;
    }

    const items = itemsQuery[options.queriesName.itemsQuery] || [];

    const extendedProps = {
      ...this.props,
      mainType,
      mainTypeIds,
      items,
      onChangeItems: this.onChangeItems
    };

    return <Items {...extendedProps} />;
  }
}

export default (props: IProps) =>
  renderWithProps<IProps>(
    props,
    compose(
      graphql<
        IProps,
        ItemsQueryResponse,
        { mainType?: string; mainTypeIds?: string[]; relType: string }
      >(gql(props.options.queries.itemsQuery), {
        name: 'itemsQuery',
        skip: ({ mainType, mainTypeIds }) => !mainType && !mainTypeIds,
        options: ({ mainType, mainTypeIds, options }) => ({
          variables: {
            mainType,
            mainTypeIds,
            relType: options.type
          }
        })
      })
    )(PortableItemsContainer)
  );
