// import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
// import { sendCommonMessage } from "../../messageBroker";

import { isEnabled } from 'erxes-api-shared/utils';

export const replaceDocuments = async (subdomain, content, target) => {
  if (!isEnabled('documents')) {
    return content;
  }

  // Regular expression to match `documents.<id>` within `{{ }}`
  const documentIds = [
    ...content.matchAll(/\{\{\s*document\.([a-zA-Z0-9_]+)\s*\}\}/g),
  ].map((match) => match[1]);

  if (!!documentIds?.length) {
    for (const documentId of documentIds) {
      // this action not avaible
      // const response = await sendCommonMessage({
      //   serviceName: "documents",
      //   subdomain,
      //   action: "printDocument",
      //   data: {
      //     ...target,
      //     _id: documentId,
      //     itemId: target._id,
      //   },
      //   isRPC: true,
      //   defaultValue: "",
      // });
      // content = content.replace(`{{ document.${documentId} }}`, response);
    }
  }

  return content;
};
