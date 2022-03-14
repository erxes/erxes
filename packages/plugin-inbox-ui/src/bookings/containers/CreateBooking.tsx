import React from "react";
import { queries as templatesQuery } from "@erxes/ui-settings/src/emailTemplates/graphql";
import { IRouterProps } from "@erxes/ui/src/types";
import Booking from "../components/Booking";
import * as compose from "lodash.flowright";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { mutations } from "../graphql";
import {
  AddBookingIntegrationMutationResponse,
  AddBookingIntegrationMutationVariables,
} from "../types";
import { IBookingData } from "@erxes/ui-settings/src/integrations/types";
import { Alert } from "@erxes/ui/src/utils";
import { withRouter } from "react-router-dom";
import {
  EmailTemplatesQueryResponse,
  EmailTemplatesTotalCountQueryResponse,
} from "@erxes/ui-settings/src/emailTemplates/types";
import { ILeadData } from "@erxes/ui-leads/src/types";
import { queries } from "../graphql";
import { queries as settingsQueries } from "@erxes/ui-settings/src/general/graphql";
import { FieldsQueryResponse } from "@erxes/ui-settings/src/properties/types";
import { ConfigsQueryResponse } from "@erxes/ui-settings/src/general/types";
import { FIELDS_GROUPS_CONTENT_TYPES } from "@erxes/ui-settings/src/properties/constants";
import { isEnabled } from "@erxes/ui/src/utils/core";

type Props = {
  history: any;
};

type FinalProps = {
  emailTemplatesQuery: EmailTemplatesQueryResponse;
  emailTemplatesTotalCountQuery: EmailTemplatesTotalCountQueryResponse;
  fieldsQuery: FieldsQueryResponse;
  configsQuery: ConfigsQueryResponse;
} & Props &
  IRouterProps &
  AddBookingIntegrationMutationResponse;

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

class CreateBookingContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = {
      loading: false,
      isReadyToSaveForm: false,
    };
  }

  render() {
    const {
      addIntegrationMutation,
      history,
      emailTemplatesQuery,
      fieldsQuery,
      configsQuery,
    } = this.props;

    const afterFormDbSave = (id: string) => {
      this.setState({ isReadyToSaveForm: false });

      if (this.state.doc) {
        addIntegrationMutation({
          variables: {
            ...this.state.doc,
            formId: id,
          },
        })
          .then(() => {
            Alert.success("You successfully added a booking");
            history.push("/bookings");
          })

          .catch((error) => {
            Alert.error(error.message);
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      }
    };

    const save = (doc) => {
      this.setState({ loading: false, isReadyToSaveForm: true, doc });
    };

    const updatedProps = {
      ...this.props,
      isActionLoading: this.state.loading,
      save,
      afterFormDbSave,
      isReadyToSaveForm: this.state.isReadyToSaveForm,
      emailTemplates: emailTemplatesQuery
        ? emailTemplatesQuery.emailTemplates || []
        : [],
      productFields: fieldsQuery.fields || [],
      configs: configsQuery.configs || [],
    };
    return <Booking {...updatedProps} />;
  }
}

export default compose(
  graphql(gql(templatesQuery.totalCount), {
    name: "emailTemplatesTotalCountQuery",
    skip: !isEnabled("engages") ? true : false,
  }),
  graphql<FinalProps, EmailTemplatesQueryResponse>(
    gql(templatesQuery.emailTemplates),
    {
      name: "emailTemplatesQuery",
      options: ({ emailTemplatesTotalCountQuery }) => ({
        variables: {
          perPage: emailTemplatesTotalCountQuery.emailTemplatesTotalCount,
        },
      }),
      skip: !isEnabled("engages") ? true : false,
    }
  ),
  graphql<
    {},
    AddBookingIntegrationMutationResponse,
    AddBookingIntegrationMutationVariables
  >(gql(mutations.integrationsCreateBooking), {
    name: "addIntegrationMutation",
  }),
  graphql<{}, FieldsQueryResponse, { contentType: string }>(
    gql(queries.fields),
    {
      name: "fieldsQuery",
      options: () => ({
        variables: {
          contentType: FIELDS_GROUPS_CONTENT_TYPES.PRODUCT,
        },
      }),
    }
  ),
  graphql<{}, ConfigsQueryResponse>(gql(settingsQueries.configs), {
    name: "configsQuery",
  })
)(withRouter<FinalProps>(CreateBookingContainer));
