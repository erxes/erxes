import { queries } from 'modules/settings/channels/graphql';
import { queries as brandQuery } from 'modules/settings/brands/graphql';

const integrations = `
  query integrations($channelId: String, $brandId: String, $perPage: Int, $page: Int, $searchValue: String) {
    integrations(channelId: $channelId, brandId: $brandId, perPage: $perPage, page: $page, searchValue: $searchValue) {
      _id
      brandId
      name
      kind
      brand {
        _id
        name
        code
      }
      formData
      formId
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
