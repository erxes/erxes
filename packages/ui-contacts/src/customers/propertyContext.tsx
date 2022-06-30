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
  conversationFields: IField[];
  customerFields: IField[];
  customerVisibility: (key: string) => IFieldsVisibility;
  deviceVisibility: (key: string) => IFieldsVisibility;
}

type FinalProps = {
  fieldsInboxQuery: InboxFieldsQueryResponse;
};

const PropertyContext = React.createContext({} as IStore);

export const PropertyConsumer = PropertyContext.Consumer;

const isVisible = (fields: IField[]) => {
  return (key: string) => {
    const data = {} as IFieldsVisibility;

    for (const field of fields || []) {
      if (field[key]) {
        data[field.type] = field.text || '';
      }
    }
    return data;
  };
};

class Provider extends React.Component<FinalProps> {
  public render() {
    const { fieldsInboxQuery } = this.props;

    if (fieldsInboxQuery && fieldsInboxQuery.loading) {
      return <Spinner />;
    }

    const inboxFields =
      (fieldsInboxQuery && fieldsInboxQuery.inboxFields) || ({} as any);

    const customerVisibility = isVisible(inboxFields.customer || []);

    const deviceVisibility = isVisible(inboxFields.device || []);

    return (
      <PropertyContext.Provider
        value={{
          deviceFields: inboxFields.device,
          conversationFields: inboxFields.conversation,
          customerFields: inboxFields.customer,
          customerVisibility,
          deviceVisibility
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
