import { getEnv } from "../commonUtils";
import { generateModels } from "../connectionResolver";

export const generatePayloadString = (conversation, btn, customerId) => {
  return JSON.stringify({
    btnId: btn._id,
    conversationId: conversation._id,
    customerId
  });
};

export const generateBotData = (
  subdomain,
  { type, buttons, text, cards, quickReplies, image }
) => {
  let botData: any[] = [];

  const generateButtons = (buttons: any[]) => {
    return buttons.map((btn: any) => ({
      title: btn.text,
      url: btn.link || null,
      type: btn.link ? "openUrl" : null
    }));
  };

  if (type === "card") {
    botData.push({
      type: "carousel",
      elements: cards.map(
        ({
          title = "",
          subtitle = "",
          image = "",
          buttons: cardButtons = []
        }) => ({
          picture: getUrl(subdomain, image),
          title,
          subtitle,
          buttons: generateButtons(cardButtons)
        })
      )
    });
  }

  if (type === "quickReplies") {
    botData.push({
      type: "custom",
      component: "QuickReplies",
      quick_replies: quickReplies.map(({ text }) => ({
        title: text
      }))
    });
  }

  if (type === "image") {
    botData.push({
      type: "file",
      url: getUrl(subdomain, image)
    });
  }

  if (type === "text" && buttons?.length > 0) {
    botData.push({
      type: "carousel",
      elements: [{ title: text, buttons: generateButtons(buttons) }]
    });
  }

  if (type === "text") {
    botData.push({
      type: "text",
      text: `<p>${text}</p>`
    });
  }

  return botData;
};

export const checkContentConditions = (content: string, conditions: any[]) => {
  for (const cond of conditions || []) {
    const keywords = (cond?.keywords || [])
      .map((keyword) => keyword.text)
      .filter((keyword) => keyword);

    switch (cond?.operator || "") {
      case "every":
        return keywords.every((keyword) => content.includes(keyword));
      case "some":
        return keywords.some((keyword) => content.includes(keyword));
      case "isEqual":
        return keywords.some((keyword) => keyword === content);
      case "isContains":
        return keywords.some((keyword) =>
          content.match(new RegExp(keyword, "i"))
        );
      case "startWith":
        return keywords.some((keyword) => content.startsWith(keyword));
      case "endWith":
        return keywords.some((keyword) => content.endsWith(keyword));
      default:
        return;
    }
  }
};

export const getUrl = (subdomain, key) => {
  const DOMAIN = getEnv({
    name: "DOMAIN",
    subdomain
  });

  const NODE_ENV = getEnv({ name: "NODE_ENV" });
  const VERSION = getEnv({ name: "VERSION" });

  if (NODE_ENV !== "production") {
    return `${DOMAIN}/read-file?key=${key}`;
  }

  if (VERSION === "saas") {
    return `${DOMAIN}/api/read-file?key=${key}`;
  }

  return `${DOMAIN}/gateway/read-file?key=${key}`;
};
