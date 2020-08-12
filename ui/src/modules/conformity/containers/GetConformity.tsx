import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IItem } from 'modules/boards/types';
import { renderWithProps } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import { IDeal } from 'modules/deals/types';
import { ITicket } from 'modules/tickets/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { ConformityQueryResponse, ISavedConformity } from '../types';

type IProps = {
  mainType?: string;
  mainTypeId?: string;
  relType?: string;
  component: any;
  queryName: string;
  itemsQuery: string;
  data?: any;
  collapseCallback?: () => void;
  alreadyItems?: ICompany[] | ICustomer[] | IDeal[] | IItem[] | ITicket[];
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
