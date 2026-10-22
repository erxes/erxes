import { gql } from '~/gql';
import type {
  FrontlineWhatsappConfigFieldsFragment,
  FrontlineWhatsappConnectionFieldsFragment,
  FrontlineWhatsappEmbeddedSignupConfigQuery,
} from '~/gql/graphql';

export const WHATSAPP_CONFIG_FIELDS = gql(`
  fragment frontlineWhatsappConfigFields on WhatsappConfig {
    appId
    configId
    verifyToken
    hasAppSecret
    webhookUrl
  }
`);

export const WHATSAPP_CONNECTION_FIELDS = gql(`
  fragment frontlineWhatsappConnectionFields on WhatsappConnection {
    _id
    erxesApiId
    wabaId
    phoneNumberId
    displayPhoneNumber
    verifiedName
    phoneStatus
    needsRegistration
    healthStatus
    error
  }
`);

export const WHATSAPP_CONFIG = gql(`
  query frontlineWhatsappConfig {
    whatsappConfig {
      ...frontlineWhatsappConfigFields
    }
  }
`);

export const WHATSAPP_UPDATE_CONFIG = gql(`
  mutation frontlineWhatsappUpdateConfig(
    $appId: String!
    $appSecret: String
    $configId: String!
    $verifyToken: String
  ) {
    whatsappUpdateConfig(
      appId: $appId
      appSecret: $appSecret
      configId: $configId
      verifyToken: $verifyToken
    ) {
      ...frontlineWhatsappConfigFields
    }
  }
`);

export const WHATSAPP_EMBEDDED_SIGNUP_CONFIG = gql(`
  query frontlineWhatsappEmbeddedSignupConfig {
    whatsappEmbeddedSignupConfig {
      appId
      configId
      graphVersion
      isConfigured
    }
  }
`);

export const WHATSAPP_EMBEDDED_SIGNUP_FINISH = gql(`
  mutation frontlineWhatsappEmbeddedSignupFinish(
    $code: String!
    $wabaId: String!
    $phoneNumberId: String!
    $businessId: String
  ) {
    whatsappEmbeddedSignupFinish(
      code: $code
      wabaId: $wabaId
      phoneNumberId: $phoneNumberId
      businessId: $businessId
    ) {
      ...frontlineWhatsappConnectionFields
    }
  }
`);

export const WHATSAPP_CONNECTION = gql(`
  query frontlineWhatsappConnection($integrationId: String!) {
    whatsappConnection(integrationId: $integrationId) {
      ...frontlineWhatsappConnectionFields
    }
  }
`);

export const WHATSAPP_DISCARD_CONNECTION = gql(`
  mutation frontlineWhatsappDiscardConnection($_id: String!) {
    whatsappDiscardConnection(_id: $_id)
  }
`);

export const WHATSAPP_REPAIR = gql(`
  mutation frontlineWhatsappRepair($_id: String!, $kind: String!) {
    integrationsRepair(_id: $_id, kind: $kind)
  }
`);

export type WhatsappConfig = FrontlineWhatsappConfigFieldsFragment;
export type WhatsappEmbeddedSignupConfig =
  FrontlineWhatsappEmbeddedSignupConfigQuery['whatsappEmbeddedSignupConfig'];
export type WhatsappConnection = FrontlineWhatsappConnectionFieldsFragment;
