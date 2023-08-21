import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import { ConformityQueryResponse, ISavedConformity } from '../types';
import { renderWithProps } from '@erxes/ui/src/utils/core';

type IProps = {
  mainType?: string;
  mainTypeId?: string;
  mainTypeName?: string;
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

    if (!alreadyItems) {
      if (!itemsQuery) {
        return null;
      }

      items = itemsQuery[queryName] || [];
    }

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
          options: ({ mainType, mainTypeId, relType }) => {
            const variables: any = {
              mainType,
              mainTypeId,
              relType,
              isSaved: true
            };

            // conformity with mainType "user" is not saved
            if (mainType === 'user') {
              variables.assignedUserIds = [mainTypeId];
              variables.isSaved = false;
            }

            // add archived items in contacts side bar
            if (mainType === 'customer' || mainType === 'company') {
              variables.noSkipArchive = true;
            }

            return { variables };
          }
        }
      )
    )(PortableItemsContainer)
  );
