import { gql } from '~/gql';

export const SALES_PAPA_CONFIG = gql(`
  query salesPapaConfig {
    salesPapaConfig {
      apiUrl
      clientId
      hasSecret
      staffId
      callbackUrl
      callbackRegisteredAt
      updatedAt
    }
  }
`);

export const SALES_PAPA_CONFIG_SAVE = gql(`
  mutation salesPapaConfigSave(
    $apiUrl: String
    $clientId: String!
    $clientSecret: String
    $staffPhone: String
    $staffEmail: String
    $staffFirstName: String
    $staffLastName: String
  ) {
    salesPapaConfigSave(
      apiUrl: $apiUrl
      clientId: $clientId
      clientSecret: $clientSecret
      staffPhone: $staffPhone
      staffEmail: $staffEmail
      staffFirstName: $staffFirstName
      staffLastName: $staffLastName
    ) {
      apiUrl
      clientId
      hasSecret
      staffId
      callbackUrl
      callbackRegisteredAt
      updatedAt
    }
  }
`);

export const SALES_PAPA_REFERENCES = gql(`
  query salesPapaReferences {
    salesPapaReferences
  }
`);

export const SALES_PAPA_ADDRESSES = gql(`
  query salesPapaAddresses {
    salesPapaAddresses
  }
`);

export const SALES_PAPA_ADDRESS_CREATE = gql(`
  mutation salesPapaAddressCreate(
    $locationId: String!
    $address: String!
    $latitude: String!
    $longitude: String!
  ) {
    salesPapaAddressCreate(
      locationId: $locationId
      address: $address
      latitude: $latitude
      longitude: $longitude
    )
  }
`);

export const SALES_POS_ORDER_PAPA_DELIVERY = gql(`
  query salesPosOrderPapaDelivery($id: String) {
    posOrderDetail(_id: $id) {
      _id
      number
      type
      status
      deliveryInfo
      papaDelivery
    }
  }
`);

export const SALES_POS_ORDER_PAPA_PHOTO_PROOF = gql(`
  query salesPosOrderPapaPhotoProof($id: String!) {
    posOrderPapaPhotoProof(_id: $id)
  }
`);

export const SALES_POS_ORDER_PAPA_QUOTE = gql(`
  mutation salesPosOrderPapaQuote(
    $id: String!
    $toLocationId: String!
    $toAddress: String!
    $toLatitude: String!
    $toLongitude: String!
    $size: String
  ) {
    posOrderPapaQuote(
      _id: $id
      toLocationId: $toLocationId
      toAddress: $toAddress
      toLatitude: $toLatitude
      toLongitude: $toLongitude
      size: $size
    )
  }
`);

export const SALES_POS_ORDER_PAPA_SEND = gql(`
  mutation salesPosOrderPapaSend(
    $id: String!
    $receiverPhone: String
    $description: String
    $receiverPays: Boolean
  ) {
    posOrderPapaSend(
      _id: $id
      receiverPhone: $receiverPhone
      description: $description
      receiverPays: $receiverPays
    )
  }
`);

export const SALES_POS_ORDER_PAPA_REFRESH = gql(`
  mutation salesPosOrderPapaRefresh($id: String!) {
    posOrderPapaRefresh(_id: $id)
  }
`);

export const SALES_POS_ORDER_PAPA_CANCEL = gql(`
  mutation salesPosOrderPapaCancel($id: String!) {
    posOrderPapaCancel(_id: $id)
  }
`);

export const SALES_POS_ORDER_PAPA_APPROVE_PHOTO = gql(`
  mutation salesPosOrderPapaApprovePhoto($id: String!) {
    posOrderPapaApprovePhoto(_id: $id)
  }
`);

export const SALES_POS_ORDER_PAPA_MARK_DELIVERED = gql(`
  mutation salesPosOrderPapaMarkDelivered($id: String!) {
    posOrderPapaMarkDelivered(_id: $id)
  }
`);
