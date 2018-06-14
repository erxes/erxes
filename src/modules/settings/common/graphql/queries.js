import { queries } from 'modules/settings/channels/graphql';
import { queries as brandQuery } from 'modules/settings/brands/graphql';

const commonParamsDef = `
  $channelId: String,
  $brandId: String,
  $kind: String,
  $perPage: Int,
  $page: Int,
  $searchValue: String
`;

const commonParams = `
  channelId: $channelId,
  brandId: $brandId,
  kind: $kind,
  perPage: $perPage,
  page: $page,
  searchValue: $searchValue
`;

const integrations = `
  query integrations(${commonParamsDef}) {
    integrations(${commonParams}) {
      _id
      brandId
      languageCode
      name
      kind
      brand {
        _id
        name
        code
      }
      formData
      twitterData
      formId
      tagIds
      tags {
        _id
        colorCode
        name
      }
      form {
        _id
        title
        code
      }
      channels {
        _id
        name
      }
    }
  }
`;

export default {
  integrations,
  channelDetail: queries.channelDetail,
  brandDetail: brandQuery.brandDetail,
  integrationsCount: queries.integrationsCount
};
