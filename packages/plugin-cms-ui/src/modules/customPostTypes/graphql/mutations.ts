import { gql } from '@apollo/client';

const ADD = gql`
    mutation CmsCustomPostTypesAdd($input: CustomPostTypeInput!) {
        cmsCustomPostTypesAdd(input: $input) {
            _id
            clientPortalId
            code
            createdAt
            label
        }
    }
`;

const EDIT = gql`
    mutation CmsCustomPostTypesEdit($id: String!, $input: CustomPostTypeInput!) {
        cmsCustomPostTypesEdit(_id: $id, input: $input) {
            _id
            clientPortalId
            code
            createdAt
            label
        }
    }
`;

const REMOVE = gql`
    mutation CmsCustomPostTypesRemove($id: String!) {
        cmsCustomPostTypesRemove(_id: $id)
    }
`;

export default {
    ADD,
    EDIT,
    REMOVE,
};