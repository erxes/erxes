import { gql } from '@apollo/client';

const VERSION_FIELDS = `
  subject
  preheader
  content
  contentJson
  savedAt
  savedUser {
    _id
    email
    details {
      fullName
    }
  }
`;

export const NOTIFICATION_TEMPLATE_FIELDS = `
  key
  title
  description
  defaultSubject
  variables {
    name
    label
    sample
    required
  }
  starterJson
  draft {
    ${VERSION_FIELDS}
  }
  published {
    ${VERSION_FIELDS}
  }
  draftRevision
  publishedRevision
  version
  fallbackCount
  lastFallbackAt
  lastFallbackReason
`;

export const NOTIFICATION_TEMPLATES = gql`
  query NotificationTemplates {
    notificationTemplates {
      ${NOTIFICATION_TEMPLATE_FIELDS}
    }
  }
`;

export const NOTIFICATION_TEMPLATE_DETAIL = gql`
  query NotificationTemplateDetail($key: String!) {
    notificationTemplateDetail(key: $key) {
      ${NOTIFICATION_TEMPLATE_FIELDS}
    }
  }
`;

export const NOTIFICATION_TEMPLATE_PREVIEW = gql`
  query NotificationTemplatePreview(
    $key: String!
    $input: NotificationTemplateInput!
  ) {
    notificationTemplatePreview(key: $key, input: $input) {
      subject
      html
      unresolved
    }
  }
`;

export const NOTIFICATION_EMAIL_BRAND = gql`
  query NotificationEmailBrand {
    notificationEmailBrand {
      name
      logoUrl
      color
      footerText
    }
  }
`;
