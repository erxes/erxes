import { sendCoreMessage } from "../messageBroker";

export default {
  types: [
    {
      label: "Team members",
      contentType: "core:user"
    }
  ],
  editorAttributes: async ({ subdomain, data }) => {
    const { contentType } = data;

    const fields = await sendCoreMessage({
      subdomain,
      action: "fields.fieldsCombinedByContentType",
      data: { contentType },
      isRPC: true,
      defaultValue: []
    });

    return fields.map(({ name, label }) => ({ value: name, name: label }));
  },
  replaceContent: async ({ subdomain, data: { itemId, content } }) => {
    const user = await sendCoreMessage({
      subdomain,
      isRPC: true,
      action: "users.findOne",
      data: {
        _id: itemId
      }
    });

    const details = user.details || {};

    content = content.replace(/{{ username }}/g, user.username);
    content = content.replace(/{{ email }}/g, user.email);
    content = content.replace(/{{ details.firstName }}/g, details.firstName);
    content = content.replace(/{{ details.lastName }}/g, details.lastName);
    content = content.replace(/{{ details.middleName }}/g, details.middleName);
    content = content.replace(/{{ details.position }}/g, details.position);
    content = content.replace(/{{ details.avatar }}/g, details.avatar);
    content = content.replace(
      /{{ details.description }}/g,
      details.description
    );

    for (const data of user.customFieldsData || []) {
      const regex = new RegExp(`{{ customFieldsData.${data.field} }}`, "g");
      content = content.replace(regex, data.stringValue);
    }

    return [content];
  }
};
