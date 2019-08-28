import gql from 'graphql-tag';
import { renderWithProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import Items from '../../components/portable/Items';
import { IOptions, ItemsQueryResponse } from '../../types';

type IProps = {
  mainType?: string;
  mainTypeId?: string;
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
    const { itemsQuery, options, mainType, mainTypeId } = this.props;

    if (!itemsQuery) {
      return null;
    }

    const items = itemsQuery[options.queriesName.itemsQuery] || [];

    const extendedProps = {
      ...this.props,
      mainType,
      mainTypeId,
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
        { mainType?: string; mainTypeId?: string; relType: string }
      >(gql(props.options.queries.itemsQuery), {
        name: 'itemsQuery',
        skip: ({ mainType, mainTypeId }) => !mainType && !mainTypeId,
        options: ({ mainType, mainTypeId, options }) => ({
          variables: {
            mainType,
            mainTypeId,
            relType: options.type,
            isSaved: true
          }
        })
      })
    )(PortableItemsContainer)
  );
