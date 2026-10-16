import { gql } from '~/gql';

export const GET_FORMS_LIST = gql(`
  query Forms(
    $type: String
    $channelId: String
    $tagId: String
    $status: String
    $searchValue: String
    $orderBy: JSON
    $skip: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
  ) {
    forms(
      type: $type
      channelId: $channelId
      tagId: $tagId
      status: $status
      searchValue: $searchValue
      orderBy: $orderBy
      skip: $skip
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      limit: $limit
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
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`);

export const GET_FORM_DETAIL = gql(`
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
        logics {
          fieldId
          logicOperator
          logicValue
        }
        logicAction
        allowSearch
        validator {
          type
          presetKey
          customRegex
          errorMessage
        }
      }
      name
      numberOfPages
      leadData
      title
      integrationId
    }
  }
`);

export const GET_FORMS_TOTAL_COUNT = gql(`
  query FormsTotalCount(
    $type: String
    $channelId: String
    $tagId: String
    $status: String
    $searchValue: String
    $orderBy: JSON
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
  ) {
    formsTotalCount(
      type: $type
      channelId: $channelId
      tagId: $tagId
      status: $status
      searchValue: $searchValue
      orderBy: $orderBy
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      limit: $limit
    ) {
      total
      byTag
      byChannel
      byStatus
    }
  }
`);

export const GET_FORMS_CHANNEL_LIST = gql(`
  query frontlineFormsChannelList(
    $name: String
    $sortField: String
    $sortDirection: Int
  ) {
    getMyChannels(
      name: $name
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      _id
      name
      icon
      scope
    }
  }
`);
