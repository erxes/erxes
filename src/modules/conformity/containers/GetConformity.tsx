import gql from 'graphql-tag';
import { renderWithProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { ConformityQueryResponse, ISavedConformity } from '../types';

type IProps = {
  mainType?: string;
  mainTypeId?: string;
  relType?: string;
  component: any;
  queryName: string;
  itemsQuery: string;
  data?: any;
  isOpen?: boolean;
};

type FinalProps = {
  itemsQuery: ConformityQueryResponse;
} & IProps;

class PortableItemsContainer extends React.Component<FinalProps> {
  onChangeItems = () => {
    const { itemsQuery } = this.props;

    itemsQuery.refetch();
  };

  render() {
    const { itemsQuery, component, queryName } = this.props;

    if (!itemsQuery) {
      return null;
    }

    const items = itemsQuery[queryName] || [];

    const extendedProps = {
      ...this.props,
      items,
      onChangeItems: this.onChangeItems
    };

    const Components = component;
    return <Components {...extendedProps} />;
  }
}

export default (props: IProps) =>
  renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps, ConformityQueryResponse, ISavedConformity>(
        gql(props.itemsQuery),
        {
          name: 'itemsQuery',
          skip: ({ mainType, mainTypeId, relType }) =>
            !mainType && !mainTypeId && !relType,
          options: ({ mainType, mainTypeId, relType }) => ({
            variables: {
              mainType,
              mainTypeId,
              relType,
              isSaved: true
            }
          })
        }
      )
    )(PortableItemsContainer)
  );
