import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const GET_FORMS_LIST = gql`
  query Forms(
    $type: String
    $channelId: String
    $tagId: String
    $status: String
    $searchValue: String
    $orderBy: JSON
    $skip: Int
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    forms(
      type: $type
      channelId: $channelId
      tagId: $tagId
      status: $status
      searchValue: $searchValue
      orderBy: $orderBy
      skip: $skip
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        code
        channelId
        channel {
          _id
          name
          icon
        }
        createdDate
        createdUserId
        channelId
        name
        status
        tagIds
        visibility
        title
        type
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_FORM_DETAIL = gql`
  query FormDetail($id: String!) {
    formDetail(_id: $id) {
      _id
      buttonText
      channelId
      code
      description
      fields {
        _id
        contentType
        contentTypeId
        description
        field
        groupId
        isRequired
        name
        options
        order
        content
        column
        validation
        text
        type
        pageNumber
      }
      name
      numberOfPages
      leadData
      title
    }
  }
`;

export const GET_FORMS_TOTAL_COUNT = gql`
  query FormsTotalCount(
    $type: String
    $channelId: String
    $tagId: String
    $status: String
    $searchValue: String
    $orderBy: JSON
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    formsTotalCount(
      type: $type
      channelId: $channelId
      tagId: $tagId
      status: $status
      searchValue: $searchValue
      orderBy: $orderBy
      ${GQL_CURSOR_PARAMS}
    ) {
      total
      byTag
      byChannel
      byStatus
    }
  }
`;
