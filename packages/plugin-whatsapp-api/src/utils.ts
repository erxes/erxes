import * as graph from "fbgraph";
import * as FormData from "form-data";
import { IModels } from "./connectionResolver";
import { debugError, debugWhatsapp } from "./debuggers";
import { generateAttachmentUrl, getConfig } from "./commonUtils";
import { IAttachment, IAttachmentMessage } from "./types";
import fetch from "node-fetch"; // Ensure this is imported
import { getEnv } from "@erxes/api-utils/src/core";

export const graphRequest = {
  base(method: string, path?: any, accessToken?: any, ...otherParams) {
    graph.setAccessToken(accessToken);
    graph.setVersion("19.0");

    return new Promise((resolve, reject) => {
      graph[method](path, ...otherParams, (error, response) => {
        if (error) {
          return reject(error);
        }
        return resolve(response);
      });
    });
  },
  get(...args): any {
    return this.base("get", ...args);
  },

  post(...args): any {
    return this.base("post", ...args);
  },

  delete(...args): any {
    return this.base("del", ...args);
  }
};

export const getPageAccessToken = async (
  number: string,
  userAccessToken: string
) => {
  const response = await graphRequest.get(
    `${number}/?fields=access_token`,
    userAccessToken
  );
  return response.access_token;
};

export const wabaUserDetail = async (
  models: IModels,
  accessToken?: string,
  kind?: string
): Promise<any[]> => {
  try {
    const response = await graphRequest.get(
      "/me?fields=id,name,businesses{verification_status,name}",
      accessToken
    );
    return response;
  } catch (error) {
    throw new Error(
      `Failed to retrieve whatsapp account details: ${error.message}`
    );
  }
};

export const sendRequest = async (url, options) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("Error in sendRequest:", error);
    throw error;
  }
};
export const uploadFileFromUrl = async (
  mediaId: string,
  mimeType: string,
  subdomain: string,
  accessToken: string
): Promise<any> => {
  try {
    const response = await graphRequest.get(mediaId, accessToken);

    const mediaUrl = response.url;

    const getMedia = await fetch(mediaUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!getMedia.ok) {
      throw new Error(
        `Failed to fetch media: ${getMedia.status} ${getMedia.statusText}`
      );
    }

    const buffer = Buffer.from(await getMedia.arrayBuffer());

    if (!buffer) {
      throw new Error("Failed to convert media response to buffer");
    }

    const domain = getEnv({
      name: "DOMAIN",
      subdomain,
      defaultValue: "http://localhost:4000"
    });
    const uploadUrl = domain.includes("zrok")
      ? `${domain}/pl:core/upload-file`
      : `${domain}/gateway/pl:core/upload-file`;

    const formData = new FormData();
    const fileExtension = mimeType.split("/")[1];

    formData.append("file", buffer, `media.${fileExtension}`);

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData
    });

    const responseBody = await uploadResponse.text();

    const contentType = uploadResponse.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const jsonData = JSON.parse(responseBody);
      return jsonData;
    } else {
      return responseBody;
    }
  } catch (error) {
    throw new Error(
      `Failed to retrieve whatsapp account details: ${error.message}`
    );
  }
};

export const getNumberWhatsApp = async (
  whatsappNumberIds: any,
  accessToken?: any
) => {
  const accounInfo: any = await graphRequest.get(
    `${whatsappNumberIds}
`,
    accessToken
  );
  return accounInfo;
};
export const getBusinessWhatsAppDetails = async (
  models: IModels,
  accessToken?: string,
  kind?: string
): Promise<any[]> => {
  try {
    const response = await graphRequest.get(
      "/me?fields=id,name,businesses{verification_status,name}",
      accessToken
    );

    const businessList = response.businesses.data || [];
    const results: any[] = [];

    for (const business of businessList) {
      const { id: businessId, name: businessName } = business;

      const wabaResponse = await graphRequest.get(
        `/${businessId}?fields=owned_whatsapp_business_accounts{id}`,
        accessToken
      );

      const ownedWhatsAppAccounts =
        wabaResponse.owned_whatsapp_business_accounts?.data || [];

      for (const account of ownedWhatsAppAccounts) {
        const wabaId = account.id;

        const phoneNumberResponse = await graphRequest.get(
          `/${wabaId}?fields=phone_numbers{id,account_mode,display_phone_number}`,
          accessToken
        );

        const phoneNumbers = phoneNumberResponse.phone_numbers?.data || [];

        if (Array.isArray(phoneNumbers) && phoneNumbers.length > 0) {
          for (const phone of phoneNumbers) {
            const integration = await models.Integrations.findOne({
              whatsappNumberIds: phone.id,
              kind
            });

            results.push({
              id: phone.id,
              name: `${phone.display_phone_number}`,
              isUsed: integration ? true : false
            });
          }
        } else {
          throw `No phone numbers found for whatsapp Business Account ID: ${wabaId}`;
        }
      }
    }

    return results;
  } catch (error) {
    throw new Error(
      `Failed to retrieve whatsapp account details: ${error.message}`
    );
  }
};

export const getPageAccessTokenFromMap = (
  pageId: string,
  pageTokens: { [key: string]: string }
): string => {
  return (pageTokens || {})[pageId];
};

export const sendReply = async (
  models: IModels,
  url: string,
  data: any,
  integrationId: string
) => {
  const integration = await models.Integrations.findOne({
    erxesApiId: integrationId
  });
  if (!integration) {
    throw new Error("Integration not found");
  }

  const { accountId } = integration;
  const account = await models.Accounts.findOne({ _id: accountId });

  if (!account) {
    throw new Error("Account not found");
  }
  const access_token = account.token;
  try {
    const response = await graphRequest.post(url, access_token, data);
    debugWhatsapp(
      `Successfully sent data to whatsapp: ${JSON.stringify(data)}`
    );
    return response;
  } catch (e) {
    debugError(
      `Error occurred while trying to send POST request to whatsapp: ${e.message}, data: ${JSON.stringify(data)}`
    );
    throw new Error(e.message);
  }
};

export const generateAttachmentMessages = (
  subdomain: string,
  attachments: IAttachment[]
) => {
  const messages: IAttachmentMessage[] = [];

  for (const attachment of attachments || []) {
    let type = "file";

    if (attachment.type.startsWith("image")) {
      type = "image";
    } else if (attachment.type.startsWith("video")) {
      type = "video";
    }

    const url = generateAttachmentUrl(subdomain, attachment.url);

    messages.push({
      attachment: {
        type,
        payload: {
          url
        }
      }
    });
  }

  return messages;
};
