import * as graph from 'fbgraph';
import * as FormData from 'form-data';
import { IModels } from './connectionResolver';
import { debugBase, debugError, debugWhatsapp } from './debuggers';
import { generateAttachmentUrl, getConfig } from './commonUtils';
import { IAttachment, IAttachmentMessage } from './types';
import { IIntegrationDocument } from './models/Integrations';
import { FacebookAdapter } from 'botbuilder-adapter-facebook-erxes';
import { Token } from 'aws-sdk';
import fetch from 'node-fetch'; // Ensure this is imported
import { getEnv } from '@erxes/api-utils/src/core';
import { readFileUrl } from '@erxes/api-utils/src/commonUtils';

export const graphRequest = {
  base(method: string, path?: any, accessToken?: any, ...otherParams) {
    // set access token
    graph.setAccessToken(accessToken);
    graph.setVersion('19.0');

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
    return this.base('get', ...args);
  },

  post(...args): any {
    return this.base('post', ...args);
  },

  delete(...args): any {
    return this.base('del', ...args);
  }
};

export const getPostDetails = async (
  pageId: string,
  pageTokens: { [key: string]: string },
  postId: string
) => {
  let pageAccessToken;

  try {
    pageAccessToken = getPageAccessTokenFromMap(pageId, pageTokens);
  } catch (e) {
    debugError(`Error occurred while getting page access token: ${e.message}`);
    throw new Error();
  }

  try {
    const response: any = await graphRequest.get(
      `/${postId}?fields=permalink_url,message,created_time,`,
      pageAccessToken
    );

    return response;
  } catch (e) {
    debugError(`Error occurred while getting whatsapp post: ${e.message}`);
    return null;
  }
};
export const getPostLink = async (accessToken: string, post_id: string) => {
  try {
    const response = await graphRequest.get(
      `${post_id}/?fields=permalink,caption,media_url,media_type,comments,username,comments_count,id,ig_id,timestamp`,
      accessToken
    );
    return response;
  } catch (e) {
    if (e.message.includes('Error validating access token')) {
      // Handle the invalid token case
      debugError(
        'Access token is invalid or expired. Reauthentication required.'
      );
      // Prompt reauthentication or refresh token logic here
    } else {
      debugError(`Error occurred while getting Instagram post: ${e.message}`);
    }
    return null;
  }
};
export const getFacebookPageIdsForInsta = async (
  accessToken: string,
  whatsappPageId: string
): Promise<string | null> => {
  try {
    const response: any = await graphRequest.get(
      '/me/accounts?fields=whatsapp_business_account,access_token,id,name',
      accessToken
    );

    if (!response || !response.data || response.data.length === 0) {
      throw new Error('No data found in response');
    }

    for (const page of response.data) {
      if (page.whatsapp_business_account) {
        const pageId = page.whatsapp_business_account.id;

        if (pageId === whatsappPageId) {
          return page.id; // Return the found page ID as a string
        }
      }
    }

    return null;
  } catch (error) {
    throw error;
  }
};
export const subscribePage = async (
  pageId,
  pageToken
): Promise<{ success: true } | any> => {
  return graphRequest.post(`${pageId}/subscribed_apps`, pageToken, {
    subscribed_fields: ['conversations', 'feed', 'messages']
  });
};

export const getPageAccessToken = async (
  pageId: string,
  userAccessToken: string
) => {
  const response = await graphRequest.get(
    `${pageId}/?fields=access_token`,
    userAccessToken
  );
  // console.log(response, 'response');

  return response.access_token;
};

export const refreshPageAccesToken = async (
  models: IModels,
  pageId: string,
  integration: IIntegrationDocument
) => {
  const account = await models.Accounts.getAccount({
    _id: integration.accountId
  });

  const facebookPageTokensMap = integration.facebookPageTokensMap || {};

  const pageAccessToken = await getPageAccessToken(pageId, account.token);

  facebookPageTokensMap[pageId] = pageAccessToken;

  await models.Integrations.updateOne(
    { _id: integration._id },
    { $set: { facebookPageTokensMap } }
  );

  return facebookPageTokensMap;
};

export const unsubscribePage = async (
  pageId,
  pageToken
): Promise<{ success: true } | any> => {
  return graphRequest
    .delete(`${pageId}/subscribed_apps`, pageToken)
    .then((res) => res)
    .catch((e) => {
      debugError(e);
      throw e;
    });
};

export const wabaUserDetail = async (
  models: IModels,
  accessToken?: string,
  kind?: string
): Promise<any[]> => {
  try {
    const response = await graphRequest.get(
      '/me?fields=id,name,businesses{verification_status,name}',
      accessToken
    );
    return response;
  } catch (error) {
    throw new Error(
      `Failed to retrieve WhatsApp account details: ${error.message}`
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
    console.error('Error in sendRequest:', error);
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
    // Retrieve media URL
    const response = await graphRequest.get(mediaId, accessToken);

    const mediaUrl = response.url;
    console.log(response, 'response');

    // Retrieve the media
    const getMedia = await fetch(mediaUrl, {
      method: 'GET',
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
      throw new Error('Failed to convert media response to buffer');
    }

    const domain = getEnv({
      name: 'DOMAIN',
      subdomain,
      defaultValue: 'http://localhost:4000'
    });
    const uploadUrl = domain.includes('zrok')
      ? `${domain}/pl:core/upload-file`
      : `${domain}/gateway/pl:core/upload-file`;

    // Prepare FormData
    const formData = new FormData();
    const fileExtension = mimeType.split('/')[1];

    // Append the buffer directly
    formData.append('file', buffer, `media.${fileExtension}`);

    // Upload the media
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    // Read the response body as text
    const responseBody = await uploadResponse.text();

    // Check response content type
    const contentType = uploadResponse.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      const jsonData = JSON.parse(responseBody);
      return jsonData;
    } else {
      return responseBody; // Return the filename as part of an object
    }
  } catch (error) {
    throw new Error(
      `Failed to retrieve WhatsApp account details: ${error.message}`
    );
  }
};

// export const uploadFileFromUrl = async (
//   mediaId: string,
//   mimeType: string,
//   subdomain: string,
//   accessToken: string
// ): Promise<any> => {
//   try {
//     // Retrieve media URL
//     const response = await graphRequest.get(mediaId, accessToken);

//     const mediaUrl = response.url;
//     console.log(response, 'response');
//     // Retrieve the image
//     const getImage = await fetch(mediaUrl, {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${accessToken}`
//       }
//     });

//     if (!getImage.ok) {
//       throw new Error(
//         `Failed to fetch image: ${getImage.status} ${getImage.statusText}`
//       );
//     }

//     // Convert the response to a buffer
//     const buffer = await getImage.buffer();
//     if (!buffer) {
//       throw new Error('Failed to convert image response to buffer');
//     }
//     const domain = getEnv({
//       name: 'DOMAIN',
//       subdomain,
//       defaultValue: 'http://localhost:4000'
//     });
//     const uploadUrl = domain.includes('zrok')
//       ? `${domain}/pl:core/upload-file`
//       : `${domain}/gateway/pl:core/upload-file`;

//     // Prepare FormData
//     const formData = new FormData();
//     formData.append('file', buffer, { filename: 'image.jpg' });
//     const fileExtension =
//       mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];

//     formData.append('file', buffer, { filename: `media.${fileExtension}` }); // Use
//     console.log(fileExtension, 'fileExtension');

//     // Upload the image
//     const uploadResponse = await fetch(uploadUrl, {
//       method: 'POST',
//       body: formData
//     });

//     // Read the response body as text
//     const responseBody = await uploadResponse.text();

//     // Check response content type
//     const contentType = uploadResponse.headers.get('content-type');

//     if (contentType && contentType.includes('application/json')) {
//       const jsonData = JSON.parse(responseBody);
//       return jsonData;
//     } else {
//       return responseBody; // Return the filename as part of an object
//     }
//   } catch (error) {
//     console.error('Error during upload process:', error);
//     throw new Error(
//       `Failed to retrieve WhatsApp account details: ${error.message}`
//     );
//   }
// };

export const getBusinessWhatsAppDetails = async (
  models: IModels,
  accessToken?: string,
  kind?: string
): Promise<any[]> => {
  try {
    // Step 1: Fetch user information, including businesses they manage
    const response = await graphRequest.get(
      '/me?fields=id,name,businesses{verification_status,name}',
      accessToken
    );

    // Extract the list of businesses managed by the user
    const businessList = response.businesses.data || [];
    const results: any[] = []; // Initialize results array

    // Step 2: Loop through each business to fetch WhatsApp Business Accounts
    for (const business of businessList) {
      const { id: businessId, name: businessName } = business;
      // console.log(business, 'business'); // Log the phone numbers for debugging

      // Fetch owned WhatsApp Business Accounts for each business
      const wabaResponse = await graphRequest.get(
        `/${businessId}?fields=owned_whatsapp_business_accounts{id}`,
        accessToken
      );

      const ownedWhatsAppAccounts =
        wabaResponse.owned_whatsapp_business_accounts?.data || [];

      // Loop through each WhatsApp Business Account to retrieve phone numbers
      for (const account of ownedWhatsAppAccounts) {
        const wabaId = account.id;

        // Fetch phone numbers associated with the WhatsApp Business Account
        const phoneNumberResponse = await graphRequest.get(
          `/${wabaId}?fields=phone_numbers{id,account_mode,display_phone_number}`,
          accessToken
        );

        // Log the phone number response for debugging

        // Access the phone numbers array correctly
        const phoneNumbers = phoneNumberResponse.phone_numbers?.data || []; // Default to empty array if not found

        // Ensure phoneNumbers is an array before iterating
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

            // results.push({
            //   businessId,
            //   businessName,
            //   wabaId,
            //   phoneId: phone.id,
            //   displayPhoneNumber: phone.display_phone_number,
            //   accountMode: phone.account_mode
            // });
          }
        } else {
          throw `No phone numbers found for WhatsApp Business Account ID: ${wabaId}`;
        }
      }
    }

    return results; // Return array of businesses with WhatsApp account details
  } catch (error) {
    throw new Error(
      `Failed to retrieve WhatsApp account details: ${error.message}`
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
  // Fetch the integration details
  const integration = await models.Integrations.findOne({
    erxesApiId: integrationId
  });
  if (!integration) {
    throw new Error('Integration not found');
  }

  // Fetch the associated account
  const { accountId } = integration;
  const account = await models.Accounts.findOne({ _id: accountId });

  if (!account) {
    throw new Error('Account not found');
  }
  const access_token = account.token;

  try {
    const response = await graphRequest.post(url, access_token, data);
    debugWhatsapp(
      `Successfully sent data to WhatsApp: ${JSON.stringify(data)}`
    );
    return response;
  } catch (e) {
    debugError(
      `Error occurred while trying to send POST request to WhatsApp: ${e.message}, data: ${JSON.stringify(data)}`
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
    let type = 'file';

    if (attachment.type.startsWith('image')) {
      type = 'image';
    } else if (attachment.type.startsWith('video')) {
      type = 'video'; // Set type to video for video attachments
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
