import { createHash } from 'crypto';
import {
  PAPA_LIST_PAGE_SIZE,
  PAPA_REQUEST_TIMEOUT_MS,
  PAPA_TOKEN_TTL_SECONDS,
  PAPA_UPDATE_VERSION_HEADER,
} from './constants';
import {
  IPapaAddress,
  IPapaCargo,
  IPapaClientInfo,
  IPapaStaff,
  IPapaApproveImage,
  IPapaCredentials,
  IPapaDynamicCreateInput,
  IPapaDynamicOrder,
  IPapaEnvelope,
  IPapaParcelOrder,
  IPapaPoint,
  IPapaQuote,
  IPapaQuoteInput,
  IPapaReferences,
  IPapaShipping,
  IPapaToken,
} from './types';

/** Minimal key-value store the client needs for token caching (Redis). */
export interface IPapaTokenStore {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    mode: 'EX',
    seconds: number,
  ): Promise<unknown>;
  del(key: string): Promise<unknown>;
}

export type TPapaFetch = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
    signal: AbortSignal;
  },
) => Promise<{ status: number; ok: boolean; text(): Promise<string> }>;

export class PapaApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly path: string,
  ) {
    super(message);
    this.name = 'PapaApiError';
  }
}

const isUnauthorized = (status: number) => status === 401 || status === 403;

/**
 * Thin typed client for the Papa Logistic organization API. Every Papa endpoint
 * is a JSON POST that answers with `{ success, message, data }`.
 */
export class PapaClient {
  private readonly apiUrl: string;
  private readonly tokenKey: string;

  constructor(
    private readonly credentials: IPapaCredentials,
    private readonly store: IPapaTokenStore,
    private readonly fetchFn: TPapaFetch = fetch,
  ) {
    this.apiUrl = credentials.apiUrl.replace(/\/+$/, '');

    const fingerprint = createHash('sha256')
      .update(
        `${this.apiUrl}|${credentials.clientId}|${credentials.clientSecret}`,
      )
      .digest('hex')
      .slice(0, 24);

    this.tokenKey = `sales_papa_token_${fingerprint}`;
  }

  /** Requests a fresh token, bypassing the cache. */
  public async authenticate(): Promise<IPapaToken> {
    const token = await this.send<IPapaToken>('/auth/token', {
      client_id: this.credentials.clientId,
      client_secret: this.credentials.clientSecret,
    });

    if (!token?.access_token) {
      throw new PapaApiError(
        'Papa did not return an access token',
        200,
        '/auth/token',
      );
    }

    await this.store.set(
      this.tokenKey,
      token.access_token,
      'EX',
      PAPA_TOKEN_TTL_SECONDS,
    );

    return token;
  }

  public getReferences() {
    return this.send<IPapaReferences>('/app/init', {});
  }

  public getClientInfo() {
    return this.call<IPapaClientInfo>('/client/get', {});
  }

  public listStaff() {
    return this.call<{ count?: number; staffs?: IPapaStaff[] }>('/staff', {});
  }

  public createStaff(input: {
    phone: string;
    email: string;
    firstname: string;
    lastname: string;
    role: 'SUPER_ADMIN' | 'MANAGER';
  }) {
    return this.call<IPapaStaff>('/staff/create', input);
  }

  public registerCallback(callbackUrl: string) {
    return this.call<{ callback_url: string }>('/client/configration', {
      callback_url: callbackUrl,
    });
  }

  /** Papa list endpoints need a `filter` object and cap `limit` at 20. */
  public listAddresses(page = 1, limit = PAPA_LIST_PAGE_SIZE) {
    return this.call<{ count: number; rows: IPapaAddress[] }>('/address', {
      filter: { query: '' },
      offset: { page, limit },
    });
  }

  public createAddress(input: {
    staff_id: string;
    location_id: string;
    address: string;
    latitude: string;
    longitude: string;
  }) {
    return this.call<IPapaAddress>('/address/create', input);
  }

  /** Papa catalog points within about 1 km of a coordinate, nearest first. */
  public async findNearestPoint(latitude: string, longitude: string) {
    const points = await this.call<IPapaPoint[] | null>('/point/elastic', {
      latitude,
      longitude,
    });

    return Array.isArray(points) ? points[0]?.id : undefined;
  }

  /**
   * Papa prices a delivery only to one of its catalog points: the body needs
   * `order_type` and the `to_point_id` nearest the destination (verified on
   * dev; the district/coordinate fields from the docs' table are ignored).
   */
  public async quote(input: IPapaQuoteInput) {
    const pointId = await this.findNearestPoint(
      input.to_latitude,
      input.to_longitude,
    );

    if (!pointId) {
      throw new PapaApiError(
        'Papa has no delivery point within about 1 km of this location; check the coordinates',
        400,
        '/point/elastic',
      );
    }

    return this.call<IPapaQuote>('/parcel_order/dynamic/calculate', {
      order_type: 'PARCEL_ORDER',
      size: input.size,
      address_id: input.address_id,
      to_point_id: pointId,
    });
  }

  /** Papa takes the quote inside the cargo as `dynamic_price_id` (verified on dev). */
  public createDynamicOrder(input: IPapaDynamicCreateInput) {
    const { quote_id: quoteId, ...rest } = input;

    return this.call<IPapaDynamicOrder>('/parcel_order/dynamic/create', {
      ...rest,
      is_description: rest.is_description ?? false,
      description: rest.description ?? null,
      is_audio: false,
      audio_id: null,
      cargo: {
        ...rest.cargo,
        dynamic_price_id: quoteId,
        is_rural_transfer: false,
        is_image: false,
        image: null,
        schedule_type: 'THREE_HOURS',
      },
    });
  }

  public confirmDynamicOrder(id: string) {
    return this.call<IPapaDynamicOrder>('/parcel_order/dynamic/confirm', {
      id,
      wish_type: 'ALL',
      driver_ids: [],
    });
  }

  public getDynamicOrder(id: string) {
    return this.call<IPapaDynamicOrder>('/parcel_order/dynamic/get', { id });
  }

  /** Cancels an announced order that no driver has accepted yet. */
  public cancelConfirmedOrder(id: string) {
    return this.call<unknown>('/parcel_order/confirm/cancel', { id });
  }

  /** Cancels an order a driver accepted but has not started. */
  public cancelAcceptedOrder(id: string) {
    return this.call<unknown>('/parcel_order/cancel', { id });
  }

  /** The store closes a started cargo itself, without pincode or photo. */
  public endCargo(cargoId: string) {
    return this.call<IPapaCargo>('/parcel_order/end_cargo', {
      id: cargoId,
      is_partner: false,
      partner_id: null,
    });
  }

  public getParcelOrder(id: string) {
    return this.call<IPapaParcelOrder>('/parcel_order/get', { id });
  }

  public getShipping(id: string) {
    return this.call<IPapaShipping>('/shipping/get', { id });
  }

  public getApproveImage(shippingId: string) {
    return this.call<IPapaApproveImage>('/approve/image/get', {
      shipping_id: shippingId,
    });
  }

  public approveImage(id: string) {
    return this.call<IPapaApproveImage>('/approve/image/success', { id });
  }

  /** Authenticated call; re-authenticates once when the cached token is rejected. */
  private async call<T>(path: string, body: object): Promise<T> {
    let token = await this.store.get(this.tokenKey);

    if (!token) {
      token = (await this.authenticate()).access_token;
    }

    try {
      return await this.send<T>(path, body, token);
    } catch (error) {
      if (!(error instanceof PapaApiError) || !isUnauthorized(error.status)) {
        throw error;
      }

      await this.store.del(this.tokenKey);
      const fresh = await this.authenticate();

      return this.send<T>(path, body, fresh.access_token);
    }
  }

  private async send<T>(
    path: string,
    body: object,
    token?: string,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      updateversion: PAPA_UPDATE_VERSION_HEADER,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PAPA_REQUEST_TIMEOUT_MS);

    let status: number;
    let text: string;

    try {
      const response = await this.fetchFn(`${this.apiUrl}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      status = response.status;
      text = await response.text();
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new PapaApiError(`Papa request failed: ${reason}`, 0, path);
    } finally {
      clearTimeout(timer);
    }

    let envelope: IPapaEnvelope<T> | undefined;

    try {
      envelope = JSON.parse(text) as IPapaEnvelope<T>;
    } catch {
      envelope = undefined;
    }

    if (status >= 400 || !envelope || envelope.success === false) {
      const message =
        envelope?.message || text.slice(0, 300) || `HTTP ${status}`;
      throw new PapaApiError(`Papa ${path}: ${message}`, status, path);
    }

    return envelope.data;
  }
}
