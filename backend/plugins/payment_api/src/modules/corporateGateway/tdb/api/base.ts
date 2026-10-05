import fetch, { HeadersInit, RequestInit } from 'node-fetch';
import { TdbTokenResponse } from '../@types/tdb';

export class BaseApi {
  protected config: {
    apiUrl: string;
    clientId: string;
    clientSecret: string;
  };

  private accessToken?: string;
  private tokenExpiresAt = 0;

  constructor(config: {
    apiUrl: string;
    clientId: string;
    clientSecret: string;
  }) {
    this.config = config;
  }

  /**
   * Get CGW OAuth access token.
   *
   * Token lifetime according to TDB CGW documentation:
   * 5 minutes.
   */
  protected async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }
    console.log('[TDB CGW] apiUrl:', this.config.apiUrl);
    console.log('[TDB CGW] token URL:', `${this.config.apiUrl}/oauth2/token`);

    const response = await fetch(`${this.config.apiUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    const responseText = await response.text();

    let result: TdbTokenResponse;

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(`TDB token response is not valid JSON: ${responseText}`);
    }

    if (!response.ok || !result.success || !result.token) {
      console.error('[TDB CGW] OAuth response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: result,
      });

      throw new Error(result.msg || 'Failed to obtain TDB access token');
    }

    this.accessToken = result.token;

    // Documentation says token is valid for 5 minutes.
    // Use a small safety buffer so we don't use an almost-expired token.
    this.tokenExpiresAt = Date.now() + 4 * 60 * 1000;

    return this.accessToken;
  }

  protected async request<T>(args: {
    method: string;
    path: string;
    params?: Record<string, string | number>;
    data?: unknown;
  }): Promise<T> {
    const token = await this.getAccessToken();

    let url = `${this.config.apiUrl}/${args.path}`;

    if (args.params) {
      const searchParams = new URLSearchParams();

      Object.entries(args.params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });

      url = `${url}?${searchParams.toString()}`;
    }

    const headers: HeadersInit = {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    console.log('[TDB CGW] REQUEST:', {
      method: args.method,
      url,
      data: args.data,
    });

    const requestOptions: RequestInit = {
      method: args.method,
      headers,
    };

    if (
      args.data !== undefined &&
      ['POST', 'PUT', 'PATCH'].includes(args.method)
    ) {
      requestOptions.body = JSON.stringify(args.data);
    }

    const response = await fetch(url, requestOptions);

    const responseText = await response.text();

    let result: any;

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(`TDB API returned invalid JSON: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(
        result?.msg ||
          result?.message ||
          `TDB API request failed with status ${response.status}`,
      );
    }

    if (result?.success === false) {
      throw new Error(
        result?.msg || result?.message || 'TDB API request failed',
      );
    }

    return result as T;
  }
}
