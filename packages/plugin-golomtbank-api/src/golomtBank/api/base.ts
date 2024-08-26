import { getAuthHeaders } from "../../utils/utils";
import fetch from "node-fetch";
import type { RequestInit, HeadersInit } from "node-fetch";
import { encryptData } from "../../utils/encrypt";
import { decryptData } from "../../utils/decrypt";
import { generateCurrentNumberString } from "../../utils/timeGenerateBase";
export class BaseApi {
  private config: any;

  constructor(config) {
    this.config = config;
  }

  async getHeaders() {
    return await getAuthHeaders(this.config);
  }

  async request(args: {
    method: string;
    path: string;
    type?: string;
    params?: any;
    data?: any;
  }) {
    const { method, path, params, data, type } = args;
    const headers = (await this.getHeaders()) || {};
    try {
      const requestOptions: RequestInit & Required<{ headers: HeadersInit }> = {
        method,
        headers,
      };
      if (data) {
        requestOptions.body = JSON.stringify(data);
      }
      requestOptions.headers["Content-Type"] = "application/json";
      const checkSum = await encryptData(
        data,
        this.config.sessionKey,
        this.config.ivKey
      );

      requestOptions.headers["X-Golomt-Checksum"] = checkSum;
      requestOptions.headers["X-Golomt-Service"] = type;

      if (type === "CGWTXNADD") {
<<<<<<< HEAD
        const xcode = generateCurrentNumberString("4IO2WPYBASQOSQMS");
        requestOptions.headers["X-Golomt-Code"] = xcode;
      }

      if (data) {
        requestOptions.body = JSON.stringify(data);
      }
=======
        const xcode = generateCurrentNumberString(this.config.golomtCode);
        requestOptions.headers["X-Golomt-Code"] = xcode;
      }
      if (!this.config.apiUrl) {
        throw new Error("Not found url");
      }
>>>>>>> 5500bd0b1cb5a46cda93260747f51eb270c15636

      const response = await fetch(
        `${this.config.apiUrl}/${path}?` + new URLSearchParams(params),
        requestOptions
      ).then((res) => res.text());

      return await decryptData(
        response,
        this.config.ivKey,
        this.config.sessionKey
      );
    } catch (e) {
      console.log("error:", e);
      throw new Error(e);
    }
  }
}
