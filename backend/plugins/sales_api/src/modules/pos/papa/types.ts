import { TPapaCarTypeGroup, TPapaSize, TPapaWeightType } from './constants';

/** Papa's response envelope for every endpoint. */
export interface IPapaEnvelope<T> {
  requestId?: string;
  timestamp?: string;
  success: boolean;
  message?: string;
  data: T;
  error?: unknown;
}

export interface IPapaToken {
  uid?: string;
  token_type?: string;
  access_token: string;
  staff_id?: string | null;
}

export interface IPapaStaff {
  id: string;
  role?: string;
  is_active?: boolean;
  firstname?: string;
  lastname?: string;
}

export interface IPapaClientInfo {
  id?: string;
  staff_id?: string | null;
  owner_type?: string;
  callback_url?: string | null;
}

export interface IPapaAddress {
  id: string;
  location_id: string;
  address: string;
  latitude: string | number;
  longitude: string | number;
}

export interface IPapaQuoteInput {
  address_id: string;
  to_location_id: string;
  to_latitude: string;
  to_longitude: string;
  to_address: string;
  size: TPapaSize;
}

/** A Papa catalog point (`/point/elastic`); dynamic deliveries end at one. */
export interface IPapaPoint {
  id: string;
}

export interface IPapaQuote {
  id: string;
  size: TPapaSize;
  distance: string | null;
  duration: number | null;
  user_price: number;
  total_amount: number;
  to_location_id: string;
  to_address: string;
  to_latitude: string;
  to_longitude: string;
  expire_timestamp: number;
}

export interface IPapaDynamicCreateInput {
  quote_id: string;
  staff_id: string;
  reference_id: string;
  car_type: string[];
  category_id: string;
  condition_id: string;
  is_description?: boolean;
  description?: string;
  cargo: {
    reference_id: string;
    name: string;
    quantity: number;
    weigth_type: TPapaWeightType;
    other_receive_phone: string;
    is_other_receive_pay?: boolean;
  };
}

export interface IPapaPerson {
  id?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  heading?: number;
}

export interface IPapaCar {
  id?: string;
  type?: string;
  capacity?: string;
  image?: string;
  rate?: string | number;
  plate?: string;
}

export interface IPapaCargo {
  id: string;
  code?: string;
  cargo_status?: string;
  shipping_id?: string | null;
  user_price?: number;
  distance?: string | null;
  duration?: number | null;
}

/** Regular `/parcel_order/get`: the only response documenting `cargos[].shipping_id`. */
export interface IPapaParcelOrder {
  id: string;
  cargos?: IPapaCargo[] | null;
}

export interface IPapaDynamicOrder {
  id: string;
  code?: string;
  reference_id?: string;
  pincode?: string;
  amount?: number;
  unpaid_amount?: number;
  is_paid?: boolean;
  parcel_order_status: string;
  parcel_order_status_date?: string;
  expire_timestamp?: number;
  driver_info?: IPapaPerson | null;
  car_info?: IPapaCar | null;
  cargo?: IPapaCargo | null;
}

export interface IPapaShipping {
  id: string;
  pincode?: string | null;
  end_pincode?: string | null;
  shipping_status?: string;
  is_approve_image?: boolean;
}

export interface IPapaApproveImage {
  id: string;
  image?: string;
  other_receive_name?: string;
  other_receive_phone?: string;
  description?: string;
  approve_image_status?: string;
}

export interface IPapaReferences {
  locations?: unknown[];
  categories?: unknown[];
  conditions?: unknown[];
  driver_car_types?: unknown[];
  parcel_order_status?: unknown[];
  [key: string]: unknown;
}

/** Credentials and environment for one tenant's Papa client. */
export interface IPapaCredentials {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
}

/** Non-secret per-POS Papa settings stored under `pos.deliveryConfig.papa`. */
export interface IPosPapaConfig {
  enabled?: boolean;
  addressId?: string;
  carTypeGroups?: TPapaCarTypeGroup[];
  categoryId?: string;
  conditionId?: string;
  size?: TPapaSize;
}

export interface IPapaDeliveryEvent {
  at: Date;
  objectType: string;
  objectAction: string;
  status?: string;
}

/** Sales-owned Papa state on a POS order (`posOrder.papaDelivery`). */
export interface IPapaDelivery {
  status: string;
  quoteId?: string;
  quoteExpiresAt?: Date;
  price?: number;
  distance?: string | null;
  duration?: number | null;
  toLocationId?: string;
  toAddress?: string;
  toLatitude?: string;
  toLongitude?: string;
  size?: TPapaSize;
  papaOrderId?: string;
  code?: string;
  pincode?: string;
  endPincode?: string | null;
  cargoId?: string;
  cargoStatus?: string;
  shippingId?: string | null;
  isPaid?: boolean;
  unpaidAmount?: number;
  hasPhotoProof?: boolean;
  driver?: IPapaPerson | null;
  car?: IPapaCar | null;
  carTypes?: string[];
  error?: string;
  sentBy?: string;
  sentAt?: Date;
  events?: IPapaDeliveryEvent[];
  updatedAt: Date;
}
