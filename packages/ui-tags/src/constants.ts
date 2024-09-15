import { __ } from "@erxes/ui/src/utils";

export const TAG_TYPES = {
  CONVERSATION: __("inbox:conversation"),
  CUSTOMER: __("core:customer"),
  ENGAGE_MESSAGE: __("engages:engageMessage"),
  AUTOMATION: __("automations:automations"),
  COMPANY: __("core:company"),
  INTEGRATION: __("inbox:integration"),
  PRODUCT: __("core:product"),
  PRODUCT_TEMPLATE: __("productTemplate"),
  DEAL: __("sales:deal"),
  TICKET: __("tickets:ticket"),
  TASK: __("tasks:task"),
  PURCHASE: __("purchases:purchase"),
  DASHBOARD: __("dashboard:dashboard"),
  REPORT: __("reports:reports"),
  FORM: __("core:form"),
  ALL_LIST: [
    "conversation",
    "customer",
    "engageMessage",
    "company",
    "integration",
    "product",
    "productTemplate",
    "deal",
    "purchase",
    "dashboard",
    "report",
    "leadForm"
  ]
};
