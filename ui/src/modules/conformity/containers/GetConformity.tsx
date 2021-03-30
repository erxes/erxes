// import GetConformity from 'erxes-ui/lib/conformity/containers/GetConformity';

// export default GetConformity;

import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { ISavedConformity } from '../types';
import { renderWithProps } from 'modules/common/utils';
import { ConformityQueryResponse } from 'erxes-ui/lib/conformity/types';

type IProps = {
  mainType?: string;
  mainTypeId?: string;
  relType?: string;
  component: any;
  queryName: string;
  itemsQuery: string;
  data?: any;
  collapseCallback?: () => void;
  alreadyItems?: any;
  actionSection?: any;
};

type FinalProps = {
  itemsQuery: ConformityQueryResponse;
} & IProps;

class PortableItemsContainer extends React.Component<FinalProps> {
  onChangeItem = () => {
    const { itemsQuery } = this.props;
    itemsQuery.refetch();
  };

  render() {
    const { itemsQuery, component, queryName, alreadyItems } = this.props;

    let items = alreadyItems;
    console.log(
      'mmmmmmmmmmmmmmmm',
      this.props.mainType,
      this.props.relType,
      alreadyItems,
      Boolean(itemsQuery)
    );

    if (!alreadyItems) {
      if (!itemsQuery) {
        return null;
      }

      items = itemsQuery[queryName] || [];
    }

    console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz', items);
    const extendedProps = {
      ...this.props,
      items,
      onChangeItem: this.onChangeItem
    };

    const Component = component;
    return <Component {...extendedProps} />;
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
          skip: ({ mainType, mainTypeId, relType, alreadyItems }) =>
            (!mainType && !mainTypeId && !relType) ||
            alreadyItems !== undefined,
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
