import { gql } from '@apollo/client';
import { NOTIFICATION_TEMPLATE_FIELDS } from './notificationTemplateQueries';

export const NOTIFICATION_TEMPLATE_SAVE_DRAFT = gql`
  mutation NotificationTemplateSaveDraft(
    $key: String!
    $draftRevision: Int!
    $input: NotificationTemplateInput!
  ) {
    notificationTemplateSaveDraft(
      key: $key
      draftRevision: $draftRevision
      input: $input
    ) {
      ${NOTIFICATION_TEMPLATE_FIELDS}
    }
  }
`;

export const NOTIFICATION_TEMPLATE_PUBLISH = gql`
  mutation NotificationTemplatePublish(
    $key: String!
    $draftRevision: Int!
    $input: NotificationTemplateInput!
  ) {
    notificationTemplatePublish(
      key: $key
      draftRevision: $draftRevision
      input: $input
    ) {
      ${NOTIFICATION_TEMPLATE_FIELDS}
    }
  }
`;

export const NOTIFICATION_TEMPLATE_REVERT = gql`
  mutation NotificationTemplateRevert($key: String!) {
    notificationTemplateRevert(key: $key) {
      ${NOTIFICATION_TEMPLATE_FIELDS}
    }
  }
`;

export const NOTIFICATION_TEMPLATE_SEND_TEST = gql`
  mutation NotificationTemplateSendTest(
    $key: String!
    $input: NotificationTemplateInput!
  ) {
    notificationTemplateSendTest(key: $key, input: $input)
  }
`;

export const NOTIFICATION_EMAIL_BRAND_UPDATE = gql`
  mutation NotificationEmailBrandUpdate($input: NotificationEmailBrandInput!) {
    notificationEmailBrandUpdate(input: $input) {
      name
      logoUrl
      color
      footerText
    }
  }
`;
