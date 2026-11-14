import { getEnv, redis } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IPosOrderDocument } from '../@types/orders';
import { IPapaConfigDocument } from '../@types/papaConfigs';
import { PapaClient } from './client';
import {
  PAPA_CALLBACK_OBJECT_TYPES,
  PAPA_CALLBACK_PATH,
  PAPA_CANCELLABLE_STATUSES,
  PAPA_DEV_API_URL,
  PAPA_LIST_PAGE_SIZE,
  PAPA_LOCAL_STATUS,
  PAPA_MAX_ADDRESS_PAGES,
  PAPA_ORDER_STATUS,
  PAPA_REFERENCES_TTL_SECONDS,
  PAPA_RESENDABLE_STATUSES,
  PAPA_SHIPPING_STATUSES,
  TPapaSize,
} from './constants';
import {
  appendEvent,
  buildCallbackUrl,
  buildDynamicCreateInput,
  isPapaSize,
  isValidCoordinate,
  normalizeMnPhone,
  orderToDelivery,
  quoteToDelivery,
  shippingToDelivery,
} from './mapping';
import {
  IPapaAddress,
  IPapaDelivery,
  IPapaReferences,
  IPosPapaConfig,
} from './types';

export interface IPapaConfigView {
  apiUrl: string;
  clientId: string;
  hasSecret: boolean;
  staffId?: string;
  callbackUrl?: string;
  callbackRegisteredAt?: Date;
  updatedAt?: Date;
}

export interface IPapaQuoteArgs {
  toLocationId: string;
  toAddress: string;
  toLatitude: string;
  toLongitude: string;
  size?: string;
}

export interface IPapaSendArgs {
  receiverPhone?: string;
  description?: string;
  receiverPays?: boolean;
}

const gatewayDomain = (subdomain: string) => {
  const domain = getEnv({ name: 'DOMAIN' });

  return (domain ? `${domain}/gateway` : 'http://localhost:4000').replace(
    '<subdomain>',
    subdomain,
  );
};

export const createPapaClient = (config: IPapaConfigDocument) =>
  new PapaClient(
    {
      apiUrl: config.apiUrl || PAPA_DEV_API_URL,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    },
    redis,
  );

export const toConfigView = (
  config: IPapaConfigDocument | null,
): IPapaConfigView | null =>
  config
    ? {
        apiUrl: config.apiUrl || PAPA_DEV_API_URL,
        clientId: config.clientId,
        hasSecret: Boolean(config.clientSecret),
        staffId: config.staffId,
        callbackUrl: config.callbackUrl,
        callbackRegisteredAt: config.callbackRegisteredAt,
        updatedAt: config.updatedAt,
      }
    : null;

/**
 * The Papa staff member orders are created as: the token's, else the
 * client's, else the client's first active admin (Business `/staff`).
 */
export interface IPapaStaffInput {
  phone?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
}

const findStaffId = async (
  client: PapaClient,
  tokenStaffId?: string | null,
): Promise<string | undefined> => {
  if (tokenStaffId) {
    return tokenStaffId;
  }

  const info = await client.getClientInfo();

  if (info?.staff_id) {
    return info.staff_id;
  }

  const staffs = (await client.listStaff())?.staffs || [];
  const active = staffs.filter((staff) => staff.is_active !== false);

  return (active.find((staff) => staff.role === 'SUPER_ADMIN') || active[0])
    ?.id;
};

/**
 * The Papa staff member orders are created as: the token's, else the
 * client's, else its first active admin, else one created from `staff`
 * (Papa's setup expects the integrator to create it).
 */
const resolveStaffId = async (
  client: PapaClient,
  tokenStaffId: string | null | undefined,
  staff: IPapaStaffInput,
): Promise<string> => {
  const existing = await findStaffId(client, tokenStaffId);

  if (existing) {
    return existing;
  }

  const phone = normalizeMnPhone(staff.phone);
  const email = staff.email?.trim();
  const firstname = staff.firstname?.trim();
  const lastname = staff.lastname?.trim();

  if (!phone || !email || !firstname || !lastname) {
    throw new Error(
      'This Papa account has no staff member yet; fill in the staff phone, email and name to create one',
    );
  }

  const created = await client.createStaff({
    phone,
    email,
    firstname: firstname.slice(0, 255),
    lastname: lastname.slice(0, 255),
    role: 'SUPER_ADMIN',
  });

  if (!created?.id) {
    throw new Error('Papa did not return the created staff member');
  }

  return created.id;
};

/**
 * Saves credentials, verifies them by requesting a token, and registers the
 * tenant's callback URL with Papa.
 */
export const savePapaConfig = async (
  models: IModels,
  subdomain: string,
  input: {
    apiUrl?: string;
    clientId: string;
    clientSecret?: string;
    staff?: IPapaStaffInput;
  },
  userId?: string,
) => {
  const clientId = (input.clientId || '').trim();

  if (!clientId) {
    throw new Error('Papa client id is required');
  }

  const apiUrl = (input.apiUrl || PAPA_DEV_API_URL).trim();

  if (!/^https:\/\//.test(apiUrl)) {
    throw new Error('Papa API URL must start with https://');
  }

  const config = await models.PapaConfigs.saveCredentials(
    { apiUrl, clientId, clientSecret: input.clientSecret?.trim() },
    userId,
  );

  const client = createPapaClient(config);
  const token = await client.authenticate();
  const staffId = await resolveStaffId(
    client,
    token.staff_id,
    input.staff || {},
  );

  const callbackUrl = buildCallbackUrl(
    gatewayDomain(subdomain),
    PAPA_CALLBACK_PATH,
    config.callbackSecret,
  );

  // Papa only accepts https callbacks. Without one (a local gateway) the
  // account still works; statuses then come from posOrderPapaRefresh.
  const canRegister = callbackUrl.startsWith('https://');

  if (canRegister) {
    await client.registerCallback(callbackUrl);
  }

  await models.PapaConfigs.setStaffAndCallback({
    staffId,
    callbackUrl: canRegister ? callbackUrl : undefined,
  });

  return toConfigView(await models.PapaConfigs.getConfig());
};

export const getPapaReferences = async (
  models: IModels,
): Promise<IPapaReferences> => {
  const config = await models.PapaConfigs.getConfigOrThrow();
  const cacheKey = `sales_papa_refs_${config.apiUrl || PAPA_DEV_API_URL}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached) as IPapaReferences;
  }

  const references = await createPapaClient(config).getReferences();

  await redis.set(
    cacheKey,
    JSON.stringify(references),
    'EX',
    PAPA_REFERENCES_TTL_SECONDS,
  );

  return references;
};

export const listPapaAddresses = async (models: IModels) => {
  const config = await models.PapaConfigs.getConfigOrThrow();
  const client = createPapaClient(config);
  const addresses: IPapaAddress[] = [];

  for (let page = 1; page <= PAPA_MAX_ADDRESS_PAGES; page++) {
    const result = await client.listAddresses(page);
    const rows = result?.rows || [];

    addresses.push(...rows);

    if (
      rows.length < PAPA_LIST_PAGE_SIZE ||
      addresses.length >= (result?.count ?? 0)
    ) {
      break;
    }
  }

  return addresses;
};

export const createPapaAddress = async (
  models: IModels,
  input: {
    locationId: string;
    address: string;
    latitude: string;
    longitude: string;
  },
): Promise<IPapaAddress> => {
  if (!input.locationId || !input.address?.trim()) {
    throw new Error('Pickup district and address are required');
  }

  if (
    !isValidCoordinate(input.latitude, 90) ||
    !isValidCoordinate(input.longitude, 180)
  ) {
    throw new Error('Pickup coordinates are invalid');
  }

  const config = await models.PapaConfigs.getConfigOrThrow();

  if (!config.staffId) {
    throw new Error('Save the Papa credentials again to load the staff id');
  }

  return createPapaClient(config).createAddress({
    staff_id: config.staffId,
    location_id: input.locationId,
    address: input.address.trim().slice(0, 500),
    latitude: String(input.latitude),
    longitude: String(input.longitude),
  });
};

const getOrderPosConfig = async (
  models: IModels,
  order: IPosOrderDocument,
): Promise<IPosPapaConfig & { addressId: string }> => {
  const pos = await models.Pos.findOne({ token: order.posToken }).lean();
  const papa: IPosPapaConfig | undefined = pos?.deliveryConfig?.papa;

  if (!papa?.enabled) {
    throw new Error('Papa delivery is not enabled for this POS');
  }

  if (!papa.addressId) {
    throw new Error('Set a Papa pickup address on this POS first');
  }

  return { ...papa, addressId: papa.addressId };
};

const assertDeliveryOrder = (order: IPosOrderDocument) => {
  if (order.type !== 'delivery') {
    throw new Error('Only delivery orders can be sent to Papa');
  }

  if (order.status === 'return') {
    throw new Error('Order is returned');
  }
};

const setDelivery = async (
  models: IModels,
  orderId: string,
  delivery: IPapaDelivery,
) => {
  await models.PosOrders.updateOne(
    { _id: orderId },
    { $set: { papaDelivery: delivery } },
  );

  return delivery;
};

export const quotePapaDelivery = async (
  models: IModels,
  orderId: string,
  args: IPapaQuoteArgs,
) => {
  const order = await models.PosOrders.getOrder(orderId);
  assertDeliveryOrder(order);

  const current = order.papaDelivery;

  if (current && !PAPA_RESENDABLE_STATUSES.includes(current.status)) {
    throw new Error(`Delivery is already ${current.status}`);
  }

  if (!args.toLocationId || !args.toAddress?.trim()) {
    throw new Error('Delivery district and address are required');
  }

  if (
    !isValidCoordinate(args.toLatitude, 90) ||
    !isValidCoordinate(args.toLongitude, 180)
  ) {
    throw new Error('Delivery coordinates are invalid');
  }

  const posConfig = await getOrderPosConfig(models, order);
  const size: TPapaSize = isPapaSize(args.size)
    ? args.size
    : posConfig.size || 'SMALL';

  const config = await models.PapaConfigs.getConfigOrThrow();
  const destination = {
    toLocationId: args.toLocationId,
    toAddress: args.toAddress.trim().slice(0, 500),
    toLatitude: String(args.toLatitude).trim(),
    toLongitude: String(args.toLongitude).trim(),
  };
  const quote = await createPapaClient(config).quote({
    address_id: posConfig.addressId,
    to_location_id: destination.toLocationId,
    to_latitude: destination.toLatitude,
    to_longitude: destination.toLongitude,
    to_address: destination.toAddress,
    size,
  });

  const now = new Date();

  return setDelivery(models, orderId, {
    ...quoteToDelivery(quote, now, destination),
    status: PAPA_LOCAL_STATUS.QUOTED,
    events: current?.events,
    updatedAt: now,
  });
};

/** Creates the Papa order from the stored quote and announces it to drivers. */
export const sendPapaDelivery = async (
  models: IModels,
  orderId: string,
  args: IPapaSendArgs,
  userId?: string,
) => {
  const order = await models.PosOrders.getOrder(orderId);
  assertDeliveryOrder(order);

  const current = order.papaDelivery;

  // A FAILED delivery that already has a Papa order only needs confirming.
  const retryConfirm =
    current?.status === PAPA_LOCAL_STATUS.FAILED && !!current.papaOrderId;

  const quoteId = current?.quoteId;

  if (
    !current ||
    !quoteId ||
    (current.status !== PAPA_LOCAL_STATUS.QUOTED && !retryConfirm)
  ) {
    throw new Error('Get a delivery quote before sending to Papa');
  }

  if (current.quoteExpiresAt && new Date(current.quoteExpiresAt) < new Date()) {
    throw new Error('The delivery quote has expired; quote again');
  }

  const receiverPhone = normalizeMnPhone(
    args.receiverPhone || order.deliveryInfo?.phone,
  );

  if (!receiverPhone) {
    throw new Error('A valid 8-digit receiver phone is required');
  }

  const posConfig = await getOrderPosConfig(models, order);
  const config = await models.PapaConfigs.getConfigOrThrow();

  if (!config.staffId) {
    throw new Error('Save the Papa credentials again to load the staff id');
  }

  // Claim the send atomically so a double click cannot create two orders.
  const claimed = await models.PosOrders.updateOne(
    { _id: orderId, 'papaDelivery.status': current.status },
    {
      $set: {
        'papaDelivery.status': PAPA_LOCAL_STATUS.SENDING,
        'papaDelivery.updatedAt': new Date(),
      },
    },
  );

  if (!claimed.modifiedCount) {
    throw new Error('Delivery is already being sent');
  }

  const client = createPapaClient(config);
  const input = buildDynamicCreateInput({
    orderId,
    orderNumber: order.number,
    quoteId,
    staffId: config.staffId,
    posConfig,
    receiverPhone,
    description: args.description ?? order.deliveryInfo?.description,
    receiverPays: args.receiverPays,
  });

  let papaOrderId = current.papaOrderId;

  try {
    if (!retryConfirm || !papaOrderId) {
      const created = await client.createDynamicOrder(input);
      papaOrderId = created.id;

      // Persist the Papa id before confirming so a failed confirm can retry.
      await models.PosOrders.updateOne(
        { _id: orderId },
        { $set: { 'papaDelivery.papaOrderId': papaOrderId } },
      );
    }

    const confirmed = await client.confirmDynamicOrder(papaOrderId);
    const now = new Date();

    return setDelivery(models, orderId, {
      ...current,
      ...orderToDelivery(confirmed, now),
      carTypes: input.car_type,
      error: undefined,
      sentBy: userId,
      sentAt: now,
      updatedAt: now,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await setDelivery(models, orderId, {
      ...current,
      status: papaOrderId ? PAPA_LOCAL_STATUS.FAILED : PAPA_LOCAL_STATUS.QUOTED,
      papaOrderId,
      error: message,
      updatedAt: new Date(),
    });

    throw error;
  }
};

/** Re-reads the Papa order (and shipping once it exists) into the order. */
export const refreshPapaDelivery = async (models: IModels, orderId: string) => {
  const order = await models.PosOrders.getOrder(orderId);
  const current = order.papaDelivery;

  if (!current?.papaOrderId) {
    throw new Error('This order has not been sent to Papa');
  }

  const config = await models.PapaConfigs.getConfigOrThrow();
  const client = createPapaClient(config);
  const papaOrder = await client.getDynamicOrder(current.papaOrderId);
  const now = new Date();

  let next: IPapaDelivery = {
    ...current,
    ...orderToDelivery(papaOrder, now),
    error: undefined,
  };

  // The dynamic get does not document `cargo.shipping_id`; the regular order
  // get does, so read it there once the driver has accepted.
  if (!next.shippingId && PAPA_SHIPPING_STATUSES.includes(next.status)) {
    const parcelOrder = await client.getParcelOrder(current.papaOrderId);
    const cargo =
      parcelOrder?.cargos?.find((row) => row.id === next.cargoId) ||
      parcelOrder?.cargos?.[0];

    next = { ...next, shippingId: cargo?.shipping_id ?? null };
  }

  if (next.shippingId) {
    const shipping = await client.getShipping(next.shippingId);
    next = { ...next, ...shippingToDelivery(shipping) };
  }

  return setDelivery(models, orderId, next);
};

export const cancelPapaDelivery = async (models: IModels, orderId: string) => {
  const order = await models.PosOrders.getOrder(orderId);
  const current = order.papaDelivery;

  if (!current?.papaOrderId) {
    throw new Error('This order has not been sent to Papa');
  }

  if (!PAPA_CANCELLABLE_STATUSES.includes(current.status)) {
    throw new Error(`A ${current.status} delivery cannot be cancelled`);
  }

  const config = await models.PapaConfigs.getConfigOrThrow();
  const client = createPapaClient(config);

  if (current.status === PAPA_ORDER_STATUS.CREATING_SHIPPING) {
    await client.cancelAcceptedOrder(current.papaOrderId);
  } else {
    await client.cancelConfirmedOrder(current.papaOrderId);
  }

  return refreshPapaDelivery(models, orderId);
};

/**
 * The store closes a started delivery itself (no pincode or photo), e.g. when
 * the receiver confirmed by phone.
 */
export const markPapaDelivered = async (models: IModels, orderId: string) => {
  const order = await models.PosOrders.getOrder(orderId);
  const current = order.papaDelivery;

  if (!current?.cargoId) {
    throw new Error('This order has not been sent to Papa');
  }

  if (current.status !== PAPA_ORDER_STATUS.START) {
    throw new Error('Only a started delivery can be marked as delivered');
  }

  const config = await models.PapaConfigs.getConfigOrThrow();

  await createPapaClient(config).endCargo(current.cargoId);

  return refreshPapaDelivery(models, orderId);
};

/** Approves the driver's photo proof, which ends the delivery. */
export const approvePapaPhotoProof = async (
  models: IModels,
  orderId: string,
) => {
  const order = await models.PosOrders.getOrder(orderId);
  const shippingId = order.papaDelivery?.shippingId;

  if (!shippingId) {
    throw new Error('Delivery has not started yet');
  }

  const config = await models.PapaConfigs.getConfigOrThrow();
  const client = createPapaClient(config);
  const proof = await client.getApproveImage(shippingId);

  if (!proof?.id) {
    throw new Error('The driver has not submitted a photo');
  }

  await client.approveImage(proof.id);

  return refreshPapaDelivery(models, orderId);
};

export const getPapaPhotoProof = async (models: IModels, orderId: string) => {
  const order = await models.PosOrders.getOrder(orderId);
  const shippingId = order.papaDelivery?.shippingId;

  if (!shippingId) {
    return null;
  }

  const config = await models.PapaConfigs.getConfigOrThrow();

  return createPapaClient(config).getApproveImage(shippingId);
};

/**
 * Handles one Papa webhook. The payload is never trusted: it only names the
 * order, whose state is then re-read from Papa with the stored order id.
 */
export const handlePapaCallback = async (
  models: IModels,
  query: Record<string, unknown>,
) => {
  const referenceId = String(query.reference_id || '');
  const objectType = String(query.object_type || '');
  const objectAction = String(query.object_action || '');

  if (
    !referenceId ||
    !(PAPA_CALLBACK_OBJECT_TYPES as readonly string[]).includes(objectType)
  ) {
    return;
  }

  const order = await models.PosOrders.findOne({ _id: referenceId }).lean();

  if (!order?.papaDelivery?.papaOrderId) {
    return;
  }

  const updated = await refreshPapaDelivery(models, referenceId);

  await models.PosOrders.updateOne(
    { _id: referenceId },
    {
      $set: {
        'papaDelivery.events': appendEvent(order.papaDelivery.events, {
          at: new Date(),
          objectType,
          objectAction,
          status: updated.status,
        }),
      },
    },
  );
};
