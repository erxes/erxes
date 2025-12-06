import { TypeExtensions } from './extensions';
import {
  mutations as knowledgeBaseMutations,
  queries as knowledgeBaseQueries,
  types as knowledgeBaseTypes,
} from '@/knowledgebase/graphql/schemas/index';
import {
  queries as vercelQueries,
  mutations as vercelMutations,
} from '@/portal/graphql/schemas/vercel';
import {
  queries as portalQueries,
  mutations as portalMutations,
  types as portalTypes,
  inputs as portalInputs,
} from '@/portal/graphql/schemas/portal';
import {
  queries as userQueries,
  mutations as userMutations,
  types as userTypes,
  inputs as userInputs,
} from '@/portal/graphql/schemas/user';
import {
  queries as commentQueries,
  types as commentTypes,
} from '@/portal/graphql/schemas/comment';
import {
  queries as notificationQueries,
  types as notificationTypes,
  inputs as notificationInputs,
  mutations as notificationMutations,
} from '@/portal/graphql/schemas/notifications';
import {
  queries as postQueries,
  types as postTypes,
  inputs as postInputs,
  mutations as postMutations,
} from '@/portal/graphql/schemas/post';
import {
  queries as pageQueries,
  types as pageTypes,
  inputs as pageInputs,
  mutations as pageMutations,
} from '@/portal/graphql/schemas/page';
import {
  queries as tagQueries,
  types as tagTypes,
  inputs as tagInputs,
  mutations as tagMutations,
} from '@/portal/graphql/schemas/tag';
import {
  queries as menuQueries,
  types as menuTypes,
  inputs as menuInputs,
  mutations as menuMutations,
} from '@/portal/graphql/schemas/menu';
import {
  queries as customPostTypeQueries,
  types as customPostTypeTypes,
  inputs as customPostTypeInputs,
  mutations as customPostTypeMutations,
} from '@/portal/graphql/schemas/customPostType';

import {
  queries as categoryQueries,
  types as categoryTypes,
  inputs as categoryInputs,
  mutations as categoryMutations,
} from '@/portal/graphql/schemas/category';



export const types = `
    ${TypeExtensions}
    ${knowledgeBaseTypes}
    ${portalTypes}
    ${portalInputs}
    ${userTypes}
    ${userInputs} 
    ${commentTypes}
    ${notificationTypes}
    ${notificationInputs}
    ${postTypes}
    ${pageTypes}
    ${tagTypes}
    ${menuTypes}
    ${customPostTypeTypes}
    ${categoryTypes}
    ${postInputs}
    ${pageInputs}
    ${tagInputs}
    ${menuInputs}
    ${customPostTypeInputs}
    ${categoryInputs}
  `;

export const queries = `
    ${knowledgeBaseQueries}
    ${vercelQueries}
    ${portalQueries}
    ${userQueries}
    ${commentQueries}
    ${notificationQueries}
    ${postQueries}
    ${pageQueries}
    ${tagQueries}
    ${menuQueries}
    ${customPostTypeQueries}
    ${categoryQueries}
  `;

export const mutations = `
    ${knowledgeBaseMutations}
    ${vercelMutations}
    ${portalMutations}
    ${userMutations}
    ${notificationMutations}
    ${postMutations}
    ${pageMutations}
    ${tagMutations}
    ${menuMutations}
    ${customPostTypeMutations}
    ${categoryMutations}
  `;

export default { types, queries, mutations };
