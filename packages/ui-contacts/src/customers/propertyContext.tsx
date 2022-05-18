import gql from 'graphql-tag';
import Spinner from '@erxes/ui/src/components/Spinner';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries as fieldQueries } from '@erxes/ui-settings/src/properties/graphql';
import { InboxFieldsQueryResponse } from '@erxes/ui-settings/src/properties/types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { IField } from '@erxes/ui/src/types';
import { IFieldsVisibility } from './types';

interface IStore {
  deviceFields: IField[];
  customerVisibilityInDetail: IFieldsVisibility;
  deviceVisibilityInDetail: IFieldsVisibility;
}

type FinalProps = {
  fieldsInboxQuery: InboxFieldsQueryResponse;
};

const PropertyContext = React.createContext({} as IStore);

export const PropertyConsumer = PropertyContext.Consumer;

const visibleInDetail = (fields: IField[]) => {
  const data = {} as IFieldsVisibility;

  for (const field of fields || []) {
    if (field.isVisibleInDetail) {
      data[field.type] = field.text;
    }
  }

  return data;
};

class Provider extends React.Component<FinalProps> {
  public render() {
    const { fieldsInboxQuery } = this.props;

    if (fieldsInboxQuery && fieldsInboxQuery.loading) {
      return <Spinner />;
    }

    const inboxFields =
      (fieldsInboxQuery && fieldsInboxQuery.inboxFields) || ({} as any);

    const customerVisibilityInDetail = visibleInDetail(
      inboxFields.customer || []
    );

    const deviceVisibilityInDetail = visibleInDetail(inboxFields.device || []);

    return (
      <PropertyContext.Provider
        value={{
          deviceFields: inboxFields.device,
          customerVisibilityInDetail,
          deviceVisibilityInDetail
        }}
      >
        {this.props.children}
      </PropertyContext.Provider>
    );
  }
}

export const PropertyProvider = compose(
  graphql(gql(fieldQueries.inboxFields), {
    name: 'fieldsInboxQuery',
    skip: !isEnabled('inbox')
  })
)(Provider);
