const integrationsArchive = `
  mutation integrationsArchive($_id: String! $status: Boolean!) {
    integrationsArchive(_id: $_id, status: $status) {
      _id
    }
  }
`;

const integrationRemove = `
  mutation integrationsRemove($_id: String!) {
    integrationsRemove(_id: $_id)
  }
`;

const commonBookingParamsDef = `
  $name: String!,
  $brandId: String!,
  $channelIds: [String]
  $formId: String!,
  $languageCode: String,
  $leadData: IntegrationLeadData
  $bookingData: IntegrationBookingData
`;

const commonBookingParams = `
  name: $name,
  brandId: $brandId,
  channelIds: $channelIds,
  formId: $formId,
  languageCode: $languageCode,
  leadData: $leadData
  bookingData: $bookingData
`;

const integrationsCreateBooking = `
  mutation integrationsCreateBookingIntegration(${commonBookingParamsDef}) {
    integrationsCreateBookingIntegration(${commonBookingParams}) {
      _id
    }
  }
`;

const integrationsEditBooking = `
  mutation integrationsEditBookingIntegration($_id: String!, ${commonBookingParamsDef}){
    integrationsEditBookingIntegration(_id: $_id, ${commonBookingParams}) {
      _id
    }
  }
`;

export default {
  integrationsArchive,
  integrationRemove,
  integrationsCreateBooking,
  integrationsEditBooking
};
