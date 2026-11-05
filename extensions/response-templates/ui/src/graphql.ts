import { gql } from './gql';
import type { ExtResponseTemplatesListQuery } from './gql/graphql';

// Every document the UI sends to the extension's own schema. Codegen
// checks them against server/graphql/schema.ts.

export const RESPONSE_TEMPLATES_LIST = gql(`
  query extResponseTemplatesList(
    $channelId: String
    $searchValue: String
    $page: Int
    $perPage: Int
  ) {
    responseTemplatesList(
      channelId: $channelId
      searchValue: $searchValue
      page: $page
      perPage: $perPage
    ) {
      list {
        _id
        name
        content
        channelId
      }
      totalCount
    }
  }
`);

export const RESPONSE_TEMPLATE_CHANNELS = gql(`
  query extResponseTemplatesChannelList {
    responseTemplatesChannels {
      _id
      name
    }
  }
`);

export const RESPONSE_TEMPLATE_COMPOSER_CHANNEL = gql(`
  query extResponseTemplatesComposerChannel(
    $contentType: String!
    $contentId: String!
  ) {
    responseTemplatesComposerChannel(
      contentType: $contentType
      contentId: $contentId
    )
  }
`);

export const RESPONSE_TEMPLATE_ADD = gql(`
  mutation extResponseTemplatesAdd(
    $name: String!
    $content: String!
    $channelId: String!
  ) {
    responseTemplatesAdd(name: $name, content: $content, channelId: $channelId) {
      _id
    }
  }
`);

export const RESPONSE_TEMPLATE_EDIT = gql(`
  mutation extResponseTemplatesEdit(
    $_id: String!
    $name: String!
    $content: String!
    $channelId: String!
  ) {
    responseTemplatesEdit(
      _id: $_id
      name: $name
      content: $content
      channelId: $channelId
    ) {
      _id
      name
      content
      channelId
    }
  }
`);

export const RESPONSE_TEMPLATE_REMOVE = gql(`
  mutation extResponseTemplatesRemove($_id: String!) {
    responseTemplatesRemove(_id: $_id) {
      _id
    }
  }
`);

export const RESPONSE_TEMPLATE_IMPORT = gql(`
  mutation extResponseTemplatesImport($cursor: String) {
    responseTemplatesImportFromFrontline(cursor: $cursor) {
      imported
      nextCursor
    }
  }
`);

// Every mutation refreshes the lists on screen, the page's and the picker's.
export const REFETCH_LISTS = ['extResponseTemplatesList'];

export type StoredTemplate =
  ExtResponseTemplatesListQuery['responseTemplatesList']['list'][number];
