export const types = `
  type AutomationResponse {
    content: String
    responseId: String
    userId: String
    sessionCode: String
  }
`;

export const subscriptions = `automationResponded(userId: String, sessionCode: String): AutomationResponse`
