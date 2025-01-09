import { gql, useQuery } from '@apollo/client';
import React from 'react'

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

const PortableItemsContainer = (props: IProps) => {

  const { itemsQuery, component, queryName,  mainType, mainTypeId, relType, alreadyItems } = props;

  const variables: any = {
    mainType,
    mainTypeId,
    relType,
    noSkipArchive: true,
    limit: 40,
    isSaved: true,
    sortField: 'status',
    sortDirection: 1
  };

  if (mainType === 'user') {
    variables.assignedUserIds = [mainTypeId];
    variables.isSaved = false;
  }

  const {data, refetch} = useQuery(gql(itemsQuery), {
    skip: (!mainType && !mainTypeId && !relType) ||
    alreadyItems !== undefined,
    variables
  })

  let items = alreadyItems;

    if (!alreadyItems) {
      if (!data) {
        return null;
      }

      items = data[queryName] || [];
    }

    const onChangeItem = () => {
      refetch()
    };

    const extendedProps = {
      ...props,
      items,
      onChangeItem
    };

    const Component = component;
    return <Component {...extendedProps} />;
}

export default PortableItemsContainer