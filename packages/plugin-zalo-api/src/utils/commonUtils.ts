import * as dotenv from "dotenv";
import * as requestify from "requestify";
import { debugExternalApi } from "@erxes/api-utils/src/debuggers";
import { IRequestParams } from "@erxes/api-utils/src/requests";
import { getEnv } from "@erxes/api-utils/src";

dotenv.config();

export const sendRequest = async (
    { url, method, headers, form, body, params }: IRequestParams,
    errorMessage?: string
) => {
    debugExternalApi(`
      Sending request to
      url: ${url}
      method: ${method}
      body: ${JSON.stringify(body)}
      params: ${JSON.stringify(params)}
    `);

    try {
        const response = await requestify.request(url, {
            method,
            headers: { "Content-Type": "application/json", ...(headers || {}) },
            form,
            body,
            params,
        });

        const responseBody = response.getBody();

        debugExternalApi(`
        Success from : ${url}
        responseBody: ${JSON.stringify(responseBody)}
      `);

        return responseBody;
    } catch (e) {
        if (e.code === "ECONNREFUSED" || e.code === "ENOTFOUND") {
            throw new Error(errorMessage);
        } else {
            const message = e.body || e.message;
            throw new Error(message);
        }
    }
};

export const generateAttachmentUrl = (urlOrName: string) => {
    const DOMAIN = getEnv({
        name: "DOMAIN",
        defaultValue: "http://localhost:4000",
    });

    if (urlOrName.startsWith("http")) {
        return urlOrName;
    }

    return `${DOMAIN}/read-file?key=${urlOrName}`;
};

export const isOASend = (eventName: string = "") => {
    return (
        eventName.startsWith("oa") ||
        eventName.startsWith("user_received") ||
        eventName.startsWith("user_seen")
    );
};

export const isAnonymousUser = (eventName: string = "") => {
    return (
        eventName.startsWith("anonymous_") ||
        eventName.startsWith("oa_send_anonymous")
    );
};

export interface ZaloMessage {
    event_name?: string;
    app_id?: string;
    message?: {
        msg_id: string;
        text: string;
        attachments?: {
            type: string;
            payload: {
                thumbnail?: string;
                url?: string;
                id?: string;
            };
        }[];
    };
    recipient: {
        id: string;
    };
    sender: {
        id: string;
    };
    timestamp?: string;
}

export const getMessageOAID = ({
    event_name,
    recipient,
    sender,
}: ZaloMessage) => {
    return isOASend(event_name) ? sender.id : recipient.id;
};

export const getMessageUserID = ({
    event_name,
    recipient,
    sender,
}: ZaloMessage) => {
    return isOASend(event_name) ? recipient.id : sender.id;
};

export const convertAttachment = (attachments: any = []) => {
    console.log(attachments);
    return attachments?.map((attachment: any) => {
        let outputAttachment: { [key: string]: any } = {};

        let name =
            attachment?.payload?.title || attachment?.payload?.description;

        delete attachment?.payload?.title;

        let type = attachment.type;
        let url = attachment?.url;

        // if( attachment?.payload?.coordinates ) {
        //     outputAttachment.url = `https://maps.google.com/maps?ll=${},${}&z=14&output=embed`
        // }

        outputAttachment = {
            ...attachment?.payload,
        };

        if (["voice"].includes(type)) {
            type = "audio";
        }
        if (["sticker", "gif", "location"].includes(type)) {
            type = "image";
        }

        if (!["text"].includes(type)) outputAttachment.type = type;

        if (name) outputAttachment.name = name;

        return outputAttachment;
    });
};
