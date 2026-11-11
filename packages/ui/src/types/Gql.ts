import { gql } from '@apollo/client';

export interface ICursorListResponse<T> {
  [key: string]: {
    list: T[];
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
  };
}

export const PAGE_INFO_FRAGMENT = gql`
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;


export const ATTACHMENT_FRAGMENT = gql`
  fragment AttachmentFragment on Attachment {
    name
    url
    type
    size
    duration
  }
`