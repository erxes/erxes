import { getEnv, redis } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IPosOrderDocument } from '../@types/orders';
import { IPapaConfigDocument } from '../@types/papaConfigs';
import { isTrustedPapaUrl, isUncertainPapaFailure, PapaClient } from './client';
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
import { syncPapaDeal } from './deal';
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
  IPapaDynamicCreateInput,
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

  // The saved secret is sent to this URL, so only Papa's own hosts qualify.
  if (!isTrustedPapaUrl(apiUrl)) {
    throw new Error(
      'Papa API URL must be an https://papa.mn address, e.g. https://api.papa.mn/api/v4',
    );
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

  // A failed send that reached Papa (or may have) still owns a Papa order;
  // a new quote would drop its id and a later send would create a second one.
  if (
    current?.status === PAPA_LOCAL_STATUS.FAILED &&
    (current.papaOrderId || current.createUncertain)
  ) {
    throw new Error(
      'This delivery already has a Papa order: send it again to finish, or cancel it before getting a new price',
    );
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
  const delivery: IPapaDelivery = {
    ...quoteToDelivery(quote, now, destination),
    status: PAPA_LOCAL_STATUS.QUOTED,
    events: current?.events,
    updatedAt: now,
  };

  // Write only if nothing changed while Papa priced it: a send that claimed
  // the order meanwhile must not be turned back into a quote.
  const written = await models.PosOrders.updateOne(
    current
      ? { _id: orderId, 'papaDelivery.status': current.status }
      : { _id: orderId, papaDelivery: { $in: [null] } },
    { $set: { papaDelivery: delivery } },
  );

  if (!written.matchedCount) {
    throw new Error('The delivery changed while getting a price; try again');
  }

  return delivery;
};

/**
 * The stored quote a send can use. A FAILED delivery that has (or may have)
 * a Papa order is a retry: it confirms that order instead of creating one.
 */
const getSendableQuote = (current: IPapaDelivery | undefined) => {
  const retry =
    current?.status === PAPA_LOCAL_STATUS.FAILED &&
    (!!current.papaOrderId || !!current.createUncertain);

  if (
    !current?.quoteId ||
    (current.status !== PAPA_LOCAL_STATUS.QUOTED && !retry)
  ) {
    throw new Error('Get a delivery quote before sending to Papa');
  }

  if (current.quoteExpiresAt && new Date(current.quoteExpiresAt) < new Date()) {
    throw new Error('The delivery quote has expired; quote again');
  }

  return { current, quoteId: current.quoteId };
};

/** What a send knows about its Papa order; read again when the send fails. */
interface IPapaSendState {
  papaOrderId?: string;
  createUncertain: boolean;
}

/**
 * The Papa order behind this send, created at most once. An order a lost
 * create response left behind is found by `reference_id` instead of being
 * created again; its id is stored before anything else happens.
 */
const ensurePapaOrder = async (
  models: IModels,
  client: PapaClient,
  orderId: string,
  input: IPapaDynamicCreateInput,
  state: IPapaSendState,
) => {
  if (state.papaOrderId) {
    return state.papaOrderId;
  }

  // A failed lookup counts as not found.
  const recover = async () =>
    (
      await client
        .findOrderByReference(orderId, input.cargo.name)
        .catch(() => undefined)
    )?.id;

  let papaOrderId = state.createUncertain ? await recover() : undefined;

  if (!papaOrderId) {
    try {
      papaOrderId = (await client.createDynamicOrder(input)).id;
    } catch (error) {
      if (!isUncertainPapaFailure(error)) {
        throw error;
      }

      papaOrderId = await recover();

      if (!papaOrderId) {
        state.createUncertain = true;
        throw error;
      }
    }
  }

  state.papaOrderId = papaOrderId;
  state.createUncertain = false;

  // Stored before confirming, so a failed confirm retries without creating.
  await models.PosOrders.updateOne(
    { _id: orderId },
    {
      $set: { 'papaDelivery.papaOrderId': papaOrderId },
      $unset: { 'papaDelivery.createUncertain': '' },
    },
  );

  return papaOrderId;
};

/**
 * Back to QUOTED only when Papa surely has no order for this send; otherwise
 * FAILED, so the next send confirms (or looks up) instead of creating.
 */
const markSendFailed = (
  models: IModels,
  orderId: string,
  current: IPapaDelivery,
  state: IPapaSendState,
  error: unknown,
) => {
  const message = error instanceof Error ? error.message : String(error);
  const ownsOrder = !!state.papaOrderId || state.createUncertain;

  return setDelivery(models, orderId, {
    ...current,
    status: ownsOrder ? PAPA_LOCAL_STATUS.FAILED : PAPA_LOCAL_STATUS.QUOTED,
    papaOrderId: state.papaOrderId,
    createUncertain: state.createUncertain || undefined,
    error: state.createUncertain
      ? `${message}. Papa may have created the order; sending again looks it up before creating another`
      : message,
    updatedAt: new Date(),
  });
};

/** Creates the Papa order from the stored quote and announces it to drivers. */
export const sendPapaDelivery = async (
  models: IModels,
  subdomain: string,
  orderId: string,
  args: IPapaSendArgs,
  userId?: string,
) => {
  const order = await models.PosOrders.getOrder(orderId);
  assertDeliveryOrder(order);

  const { current, quoteId } = getSendableQuote(order.papaDelivery);
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
  const state: IPapaSendState = {
    papaOrderId: current.papaOrderId,
    createUncertain: !!current.createUncertain,
  };

  try {
    const papaOrderId = await ensurePapaOrder(
      models,
      client,
      orderId,
      input,
      state,
    );
    const confirmed = await client.confirmDynamicOrder(papaOrderId);
    const now = new Date();

    const delivery = await setDelivery(models, orderId, {
      ...current,
      ...orderToDelivery(confirmed, now),
      carTypes: input.car_type,
      createUncertain: undefined,
      error: undefined,
      sentBy: userId,
      sentAt: now,
      updatedAt: now,
    });

    await syncPapaDeal({ subdomain, models, orderId });

    return delivery;
  } catch (error) {
    await markSendFailed(models, orderId, current, state, error);
    throw error;
  }
};

/** Re-reads the Papa order (and shipping once it exists) into the order. */
export const refreshPapaDelivery = async (
  models: IModels,
  subdomain: string,
  orderId: string,
) => {
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

  const delivery = await setDelivery(models, orderId, next);

  await syncPapaDeal({ subdomain, models, orderId });

  return delivery;
};

export const cancelPapaDelivery = async (
  models: IModels,
  subdomain: string,
  orderId: string,
) => {
  const order = await models.PosOrders.getOrder(orderId);
  let current = order.papaDelivery;

  if (!current?.papaOrderId) {
    throw new Error('This order has not been sent to Papa');
  }

  const { papaOrderId } = current;

  // A failed send leaves a Papa order behind; cancel it by Papa's own status.
  if (current.status === PAPA_LOCAL_STATUS.FAILED) {
    current = await refreshPapaDelivery(models, subdomain, orderId);
  }

  if (!PAPA_CANCELLABLE_STATUSES.includes(current.status)) {
    throw new Error(`A ${current.status} delivery cannot be cancelled`);
  }

  const config = await models.PapaConfigs.getConfigOrThrow();
  const client = createPapaClient(config);

  if (current.status === PAPA_ORDER_STATUS.CREATING_SHIPPING) {
    await client.cancelAcceptedOrder(papaOrderId);
  } else {
    await client.cancelConfirmedOrder(papaOrderId);
  }

  return refreshPapaDelivery(models, subdomain, orderId);
};

/**
 * The store closes a started delivery itself (no pincode or photo), e.g. when
 * the receiver confirmed by phone.
 */
export const markPapaDelivered = async (
  models: IModels,
  subdomain: string,
  orderId: string,
) => {
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

  return refreshPapaDelivery(models, subdomain, orderId);
};

const toAmount = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

/**
 * The business wallet Papa takes delivery fees from when a delivery ends.
 * `available` is what a new fee can use (Papa holds part of the balance for
 * deliveries in progress).
 */
export const getPapaWallet = async (models: IModels) => {
  const config = await models.PapaConfigs.getConfigOrThrow();
  const client = createPapaClient(config);
  const partnerId = (await client.getClientInfo())?.owner_id;

  if (!partnerId) {
    throw new Error('Papa did not return the business id for this account');
  }

  const wallet = await client.getWallet(partnerId);
  const balance = toAmount(wallet?.balance);
  const hold = toAmount(wallet?.hold);

  return {
    code: wallet?.code ?? null,
    balance,
    hold,
    available: balance - hold,
    allowNegative: !!wallet?.allow_negative,
    status: wallet?.account_status ?? null,
  };
};

export const PAPA_PAYMENT_METHODS = ['wallet', 'outside'] as const;
export type TPapaPaymentMethod = (typeof PAPA_PAYMENT_METHODS)[number];

/**
 * Pays a delivered order Papa could not take from the wallet: again from the
 * wallet (after a top-up) or recorded as paid outside Papa (cash, transfer).
 */
export const payPapaDelivery = async (
  models: IModels,
  subdomain: string,
  orderId: string,
  method: TPapaPaymentMethod,
) => {
  if (!PAPA_PAYMENT_METHODS.includes(method)) {
    throw new Error('Unknown Papa payment method');
  }

  const order = await models.PosOrders.getOrder(orderId);
  const current = order.papaDelivery;

  if (!current?.papaOrderId) {
    throw new Error('This order has not been sent to Papa');
  }

  if (current.isPaid || current.status === PAPA_ORDER_STATUS.COMPLETED) {
    throw new Error('This delivery is already paid');
  }

  if (current.status !== PAPA_ORDER_STATUS.END) {
    throw new Error('Only a delivered order can be paid');
  }

  const config = await models.PapaConfigs.getConfigOrThrow();
  const client = createPapaClient(config);

  if (method === 'outside') {
    await client.markPaidOutside(current.papaOrderId);
  } else {
    if (!config.staffId) {
      throw new Error('Save the Papa credentials again to load the staff id');
    }

    try {
      await client.payFromWallet(current.papaOrderId, config.staffId);
    } catch (error) {
      if (error instanceof Error && /үлдэгдэл/i.test(error.message)) {
        throw new Error(
          `${error.message}. The Papa wallet balance is too low: top it up in the Papa Business app or business.papa.mn`,
        );
      }

      throw error;
    }
  }

  return refreshPapaDelivery(models, subdomain, orderId);
};

/** Approves the driver's photo proof, which ends the delivery. */
export const approvePapaPhotoProof = async (
  models: IModels,
  subdomain: string,
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

  return refreshPapaDelivery(models, subdomain, orderId);
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

/** A callback query value as text; arrays or objects (`?a[]=x`) count as absent. */
const queryText = (value: unknown) => (typeof value === 'string' ? value : '');

/**
 * Handles one Papa webhook. The payload is never trusted: it only names the
 * order, whose state is then re-read from Papa with the stored order id.
 */
export const handlePapaCallback = async (
  models: IModels,
  subdomain: string,
  query: Record<string, unknown>,
) => {
  const referenceId = queryText(query.reference_id);
  const objectType = queryText(query.object_type);
  const objectAction = queryText(query.object_action);

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

  const updated = await refreshPapaDelivery(models, subdomain, referenceId);

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
