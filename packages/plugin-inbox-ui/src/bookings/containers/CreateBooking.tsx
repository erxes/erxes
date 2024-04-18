import * as compose from "lodash.flowright";

import {
  AddBookingIntegrationMutationResponse,
  AddBookingIntegrationMutationVariables,
} from "../types";

import { Alert } from "@erxes/ui/src/utils";
import Booking from "../components/Booking";
import { ConfigsQueryResponse } from "@erxes/ui-settings/src/general/types";
import { FIELDS_GROUPS_CONTENT_TYPES } from "@erxes/ui-forms/src/settings/properties/constants";
import { FieldsQueryResponse } from "@erxes/ui-forms/src/settings/properties/types";
import { IBookingData } from "@erxes/ui-inbox/src/settings/integrations/types";
import { ILeadData } from "@erxes/ui-leads/src/types";
import React, { useState } from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { mutations } from "../graphql";
import { queries } from "../graphql";
import { queries as settingsQueries } from "@erxes/ui-settings/src/general/graphql";
import { useNavigate } from "react-router-dom";

type Props = {};

type FinalProps = {
  emailTemplatesQuery: any /*change type*/;
  emailTemplatesTotalCountQuery: any /*change type*/;
  fieldsQuery: FieldsQueryResponse;
  configsQuery: ConfigsQueryResponse;
} & Props &
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

const CreateBookingContainer = (props: FinalProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isReadyToSaveForm, setIsReadyToSaveForm] = useState(false);
  const [doc, setDoc] = useState<{
    name: string;
    brandId: string;
    languageCode: string;
    leadData: ILeadData;
    channelIds?: string[];
    bookingData: IBookingData;
  }>({} as any);
  const {
    addIntegrationMutation,
    emailTemplatesQuery,
    fieldsQuery,
    configsQuery,
  } = props;

  const afterFormDbSave = (id: string) => {
    setIsReadyToSaveForm(false);

    if (doc) {
      addIntegrationMutation({
        variables: {
          ...doc,
          formId: id,
        },
      })
        .then(() => {
          Alert.success("You successfully added a booking");
          navigate("/bookings");
        })

        .catch((error) => {
          Alert.error(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const save = (doc) => {
    setLoading(false);
    setIsReadyToSaveForm(true);
    setDoc(doc);
  };

  const updatedProps = {
    ...props,
    isActionLoading: loading,
    save,
    afterFormDbSave,
    isReadyToSaveForm: isReadyToSaveForm,
    emailTemplates: emailTemplatesQuery
      ? emailTemplatesQuery.emailTemplates || []
      : [],
    productFields: fieldsQuery.fields || [],
    configs: configsQuery.configs || [],
  };
  return <Booking {...updatedProps} />;
};

export default compose(
  graphql(gql(queries.templateTotalCount), {
    name: "emailTemplatesTotalCountQuery",
    skip: !isEnabled("engages") ? true : false,
  }),
  graphql<FinalProps>(gql(queries.emailTemplates), {
    name: "emailTemplatesQuery",
    options: ({ emailTemplatesTotalCountQuery }) => ({
      variables: {
        perPage: emailTemplatesTotalCountQuery.emailTemplatesTotalCount,
      },
    }),
    skip: !isEnabled("engages") ? true : false,
  }),
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
)(CreateBookingContainer);
