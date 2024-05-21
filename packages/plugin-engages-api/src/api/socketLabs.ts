import type { RequestInit, HeadersInit } from 'node-fetch';
import { hostname } from 'os';

export class SocketLabs {
  private apiToken: string;
  private serverId: string;
  private apiUrl: string = 'https://api.socketlabs.com';
  private username: string;

  constructor({ apiToken, serverId, username }) {
    this.apiToken = apiToken;
    this.serverId = serverId;
    this.username = username;
  }

  private async request(args: {
    method: string;
    path: string;
    params?: any;
    body?: any;
    headers?: any;
  }) {
    const { method, path, params, body, headers = {} } = args;
    console.log('sending request to ', path);
    console.log('params ', params);
    console.log('body ', body);
    console.log('headers ', headers);

    try {
      const requestOptions: any = {
        method,
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          ...headers,
        },
      };

      if (body) {
        requestOptions.body = JSON.stringify(body);
        requestOptions.headers['Content-Type'] = 'application/json';
      }
      const url = `${this.apiUrl}/v2/servers/${this.serverId}/${path}`;

      const finalUrl = params ? url + '?' + new URLSearchParams(params) : url;

      const res = await fetch(finalUrl, requestOptions);

      console.log(
        `${this.apiUrl}/v2/servers/${this.serverId}/${path}` +
          new URLSearchParams(params),
      );

      return res;
    } catch (e) {
      console.error('errorrrr ', e);
      throw new Error(e.message);
    }
  }

  async sendVerificationRequest(email: string) {
    const domain = email.split('@')[1];

    try {
      const response: any = await this.request({
        path: `sending-domains/${domain}/verify/send`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          username: this.username,
          requestType: 'Config',
          emailAddress: email,
          domain,
        },
      }).then((r) => r.json());

      const { data, error } = response;

      if (error && error[0]) {
        throw new Error(error[0].message);
      }

      if (data.result) {
        return 'verification email sent';
      }

      return 'failed';
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async checkEmail(email: string) {
    const domain = email.split('@')[1];

    try {
      const response: any = await this.request({
        path: `sending-domains/detail/${domain}`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }).then((r) => r.json());

      console.log('response', response);

      const { data, error } = response;

      if (error && error[0] && error[0].errorType === 'DomainNotFound') {
        return this.registerEmail(email);
      }

      const verificationStatus = {
        isEmailVerified: false,
        isDomainVerified: false,
      };
      console.log('data ', data);

      if (data && data.verificationStatus === 'Complete') {
        verificationStatus.isEmailVerified = true;
      }

      if (data && data.authenticationStatus !== 'Unauthenticated') {
        verificationStatus.isDomainVerified = true;
      }

      return verificationStatus;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async registerEmail(email: string) {
    const domain = email.split('@')[1];

    const verificationStatus = {
      isEmailVerified: false,
      isDomainVerified: false,
    };

    try {
      const response: any = await this.request({
        path: 'sending-domains',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { domain },
      }).then((r) => r.json());

      const { data, error } = response;

      if (error && error.length > 0) {
        if (error[0].errorType === 'DomainAlreadyExists') {
          verificationStatus.isDomainVerified = true;
          verificationStatus.isEmailVerified = true;

          return verificationStatus;
        }

        if (error[0].errorType === 'EmailRestricted') {
          throw new Error(
            `Emails cannot be sent from ${domain}. Please use your company email address instead.`,
          );
        }

        throw new Error(error[0].message);
      }

      if (data && data.verificationStatus === 'Complete') {
        verificationStatus.isEmailVerified = true;
      }

      if (data && data.authenticationStatus !== 'Unauthenticated') {
        verificationStatus.isDomainVerified = true;
      }

      return verificationStatus;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getCNAMEConf(email: string) {
    const domain = email.split('@')[1];

    return {
      hostname: `dkim._domainkey.${domain}`,
      value: 'dkim._domainkey.email-od.com',
    };
  }

  async getVerifiedDomains() {
    const response: any = await this.request({
      path: 'sending-domains/detail',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).then((r) => r.json());

    const { data, error } = response;

    if (error && error.length > 0) {
      throw new Error(error.message);
    }

    const verified = data.filter(
      (d) =>
        d.verificationStatus === 'Complete' &&
        d.authenticationStatus !== 'Unauthenticated',
    );

    return verified.map((d) => d.sendingDomain);
  }
}
