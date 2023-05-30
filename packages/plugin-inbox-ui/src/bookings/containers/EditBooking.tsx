import * as compose from 'lodash.flowright';

import {
  BookingIntegrationDetailQueryResponse,
  EditBookingIntegrationMutationResponse,
  EditBookingIntegrationMutationVariables
} from '../types';
import { mutations, queries } from '../graphql';

import { Alert } from '@erxes/ui/src/utils';
import Booking from '../components/Booking';
import { ConfigsQueryResponse } from '@erxes/ui-settings/src/general/types';
import { FIELDS_GROUPS_CONTENT_TYPES } from '@erxes/ui-forms/src/settings/properties/constants';
import { FieldsQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import { IBookingData } from '@erxes/ui-inbox/src/settings/integrations/types';
import { ILeadData } from '@erxes/ui-leads/src/types';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { queries as settingsQueries } from '@erxes/ui-settings/src/general/graphql';
import { withRouter } from 'react-router-dom';

type Props = {
  queryParams: any;
  contentTypeId: string;
  history: any;
};

type FinalProps = {
  integrationDetailQuery: BookingIntegrationDetailQueryResponse;
  emailTemplatesQuery: any /*change type*/;
  emailTemplatesTotalCountQuery: any /*change type*/;
  fieldsQuery: FieldsQueryResponse;
  configsQuery: ConfigsQueryResponse;
} & IRouterProps &
  Props &
  EditBookingIntegrationMutationResponse;

type State = {
  loading: boolean;
  isReadyToSaveForm: boolean;
  doc?: {
    name: string;
    brandId: string;
    languageCode: string;
    leadData: ILeadData;
    channelIds?: string[];
    bookingData: IBookingData;
  };
};

class EditBookingContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = {
      loading: false,
      isReadyToSaveForm: false
    };
  }

  render() {
    const {
      integrationDetailQuery,
      editIntegrationMutation,
      history,
      emailTemplatesQuery,
      fieldsQuery,
      configsQuery
    } = this.props;

    if (integrationDetailQuery.loading) {
      return null;
    }

    const integration = integrationDetailQuery.integrationDetail;

    const afterFormDbSave = (id: string) => {
      this.setState({ isReadyToSaveForm: false });

      if (this.state.doc) {
        editIntegrationMutation({
          variables: {
            _id: integration._id,
            formId: id,
            ...this.state.doc
          }
        })
          .then(() => {
            Alert.success('You successfully edited a booking');
            history.push('/bookings');
          })

          .catch(error => {
            Alert.error(error.message);
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      }
    };

    const save = doc => {
      this.setState({ loading: false, isReadyToSaveForm: true, doc });
    };

    const updatedProps = {
      ...this.props,
      integration,
      isActionLoading: this.state.loading,
      save,
      afterFormDbSave,
      isReadyToSaveForm: this.state.isReadyToSaveForm,
      emailTemplates: emailTemplatesQuery
        ? emailTemplatesQuery.emailTemplates || []
        : [],
      productFields: fieldsQuery.fields || [],
      configs: configsQuery.configs || []
    };

    return <Booking {...updatedProps} />;
  }
}

const commonOptions = () => ({
  refetchQueries: [
    { query: gql(queries.integrations) },
    { query: gql(queries.integrationsTotalCount) }
  ]
});

export default compose(
  graphql(gql(queries.templateTotalCount), {
    name: 'emailTemplatesTotalCountQuery',
    skip: !isEnabled('engages') ? true : false
  }),
  graphql<FinalProps>(gql(queries.emailTemplates), {
    name: 'emailTemplatesQuery',
    options: ({ emailTemplatesTotalCountQuery }) => ({
      variables: {
        perPage: emailTemplatesTotalCountQuery.emailTemplatesTotalCount
      }
    }),
    skip: !isEnabled('engages') ? true : false
  }),
  graphql<
    {},
    EditBookingIntegrationMutationResponse,
    EditBookingIntegrationMutationVariables
  >(gql(mutations.integrationsEditBooking), {
    name: 'editIntegrationMutation',
    options: commonOptions
  }),
  graphql<Props, BookingIntegrationDetailQueryResponse, { _id: string }>(
    gql(queries.integrationDetail),
    {
      name: 'integrationDetailQuery',
      options: ({ contentTypeId }) => ({
        fetchPolicy: 'cache-and-network',
        variables: {
          _id: contentTypeId
        }
      })
    }
  ),
  graphql<{}, FieldsQueryResponse, { contentType: string }>(
    gql(queries.fields),
    {
      name: 'fieldsQuery',
      options: () => ({
        variables: {
          contentType: FIELDS_GROUPS_CONTENT_TYPES.PRODUCT
        }
      })
    }
  ),
  graphql<{}, ConfigsQueryResponse>(gql(settingsQueries.configs), {
    name: 'configsQuery'
  })
)(withRouter(EditBookingContainer));
