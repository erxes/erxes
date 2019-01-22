export const EMAIL_CONTENT_CLASS = "erxes-email-content";
export const EMAIL_CONTENT_PLACEHOLDER = `<div class="${EMAIL_CONTENT_CLASS}"></div>`;

export const LANGUAGE_CHOICES = ["", "mn", "en"];

export const CONVERSATION_STATUSES = {
  NEW: "new",
  OPEN: "open",
  CLOSED: "closed",
  ALL: ["new", "open", "closed"]
};

export const INTEGRATION_KIND_CHOICES = {
  MESSENGER: "messenger",
  FORM: "form",
  TWITTER: "twitter",
  FACEBOOK: "facebook",
  ALL: ["messenger", "form", "twitter", "facebook"]
};

export const TAG_TYPES = {
  CONVERSATION: "conversation",
  CUSTOMER: "customer",
  ENGAGE_MESSAGE: "engageMessage",
  COMPANY: "company",
  INTEGRATION: "integration",
  ALL: ["conversation", "customer", "engageMessage", "company", "integration"]
};

export const FACEBOOK_DATA_KINDS = {
  FEED: "feed",
  MESSENGER: "messenger",
  ALL: ["feed", "messenger"]
};

export const MESSENGER_KINDS = {
  CHAT: "chat",
  NOTE: "note",
  POST: "post",
  ALL: ["chat", "note", "post"]
};

export const SENT_AS_CHOICES = {
  BADGE: "badge",
  SNIPPET: "snippet",
  FULL_MESSAGE: "fullMessage",
  ALL: ["badge", "snippet", "fullMessage"]
};

export const MESSAGE_KINDS = {
  AUTO: "auto",
  VISITOR_AUTO: "visitorAuto",
  MANUAL: "manual",
  ALL: ["auto", "visitorAuto", "manual"]
};

export const METHODS = {
  MESSENGER: "messenger",
  EMAIL: "email",
  ALL: ["messenger", "email"]
};

export const FORM_LOAD_TYPES = {
  SHOUTBOX: "shoutbox",
  POPUP: "popup",
  EMBEDDED: "embedded",
  DROPDOWN: "dropdown",
  SLIDEINLEFT: "slideInLeft",
  SLIDEINRIGHT: "slideInRight",
  ALL: [
    "",
    "shoutbox",
    "popup",
    "embedded",
    "dropdown",
    "slideInLeft",
    "slideInRight"
  ]
};

export const FORM_SUCCESS_ACTIONS = {
  EMAIL: "email",
  REDIRECT: "redirect",
  ONPAGE: "onPage",
  ALL: ["", "email", "redirect", "onPage"]
};

export const KIND_CHOICES = {
  MESSENGER: "messenger",
  FORM: "form",
  TWITTER: "twitter",
  FACEBOOK: "facebook",
  GMAIL: "gmail",
  ALL: ["messenger", "form", "twitter", "facebook", "gmail"]
};

// module constants
export const NOTIFICATION_TYPES = {
  CHANNEL_MEMBERS_CHANGE: "channelMembersChange",
  CONVERSATION_ADD_MESSAGE: "conversationAddMessage",
  CONVERSATION_ASSIGNEE_CHANGE: "conversationAssigneeChange",
  CONVERSATION_STATE_CHANGE: "conversationStateChange",
  ALL: [
    "channelMembersChange",
    "conversationAddMessage",
    "conversationAssigneeChange",
    "conversationStateChange"
  ]
};

export const NOTIFICATION_MODULES = [
  {
    name: "conversations",
    description: "Conversations",
    types: [
      {
        name: "conversationStateChange",
        text: "State change"
      },
      {
        name: "conversationAssigneeChange",
        text: "Assignee change"
      },
      {
        name: "conversationAddMessage",
        text: "Add message"
      }
    ]
  },

  {
    name: "channels",
    description: "Channels",
    types: [
      {
        name: "channelMembersChange",
        text: "Members change"
      }
    ]
  }
];

export const FORM_FIELDS = {
  TYPES: {
    INPUT: "input",
    TEXT_AREA: "textarea",
    RADIO: "radio",
    CHECK: "check",
    SELECT: "select",
    DIVIDER: "divider",
    EMAIL: "email",
    FIRST_NAME: "firstName",
    LAST_NAME: "lastName",
    ALL: [
      "input",
      "textarea",
      "radio",
      "check",
      "select",
      "divider",
      "email",
      "firstName",
      "lastName"
    ]
  },
  VALIDATION: {
    BLANK: "",
    NUMBER: "number",
    DATE: "date",
    EMAIL: "email",
    ALL: ["", "number", "date", "email"]
  }
};

// messenger data availability constants
export const MESSENGER_DATA_AVAILABILITY = {
  MANUAL: "manual",
  AUTO: "auto",
  ALL: ["manual", "auto"]
};

export const FIELD_CONTENT_TYPES = {
  FORM: "form",
  CUSTOMER: "customer",
  COMPANY: "company",
  ALL: ["form", "customer", "company"]
};

export const COC_CONTENT_TYPES = {
  CUSTOMER: "customer",
  COMPANY: "company",
  USER: "user",
  DEAL: "deal",
  ALL: ["customer", "company", "user", "deal"]
};

export const ROLES = {
  ADMIN: "admin",
  CONTRIBUTOR: "contributor"
};

export const PUBLISH_STATUSES = {
  DRAFT: "draft",
  PUBLISH: "publish",
  ALL: ["draft", "publish"]
};

export const ACTIVITY_TYPES = {
  CUSTOMER: "customer",
  COMPANY: "company",
  INTERNAL_NOTE: "internal_note",
  CONVERSATION: "conversation",
  SEGMENT: "segment",
  DEAL: "deal",
  EMAIL: "email",

  ALL: [
    "customer",
    "company",
    "internal_note",
    "conversation",
    "segment",
    "deal",
    "email"
  ]
};

export const ACTIVITY_ACTIONS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  SEND: "send",

  ALL: ["create", "update", "delete", "send"]
};

export const ACTIVITY_PERFORMER_TYPES = {
  SYSTEM: "SYSTEM",
  USER: "USER",
  CUSTOMER: "CUSTOMER",
  DEAL: "DEAL",

  ALL: ["SYSTEM", "USER", "CUSTOMER", "DEAL"]
};

export const PRODUCT_TYPES = {
  PRODUCT: "product",
  SERVICE: "service",
  ALL: ["product", "service"]
};

export const FIELDS_GROUPS_CONTENT_TYPES = {
  CUSTOMER: "customer",
  COMPANY: "company",
  ALL: ["customer", "company"]
};

export const CUSTOMER_LEAD_STATUS_TYPES = [
  "",
  "new",
  "open",
  "inProgress",
  "openDeal",
  "unqualified",
  "attemptedToContact",
  "connected",
  "badTiming"
];

export const CUSTOMER_LIFECYCLE_STATE_TYPES = [
  "",
  "subscriber",
  "lead",
  "marketingQualifiedLead",
  "salesQualifiedLead",
  "opportunity",
  "customer",
  "evangelist",
  "other"
];

export const CUSTOMER_BASIC_INFOS = [
  "firstName",
  "lastName",
  "primaryEmail",
  "primaryPhone",
  "ownerId",
  "position",
  "department",
  "leadStatus",
  "lifecycleState",
  "hasAuthority",
  "description",
  "doNotDisturb"
];

export const COMPANY_LEAD_STATUS_TYPES = [
  "",
  "new",
  "open",
  "inProgress",
  "openDeal",
  "unqualified",
  "attemptedToContact",
  "connected",
  "badTiming"
];

export const COMPANY_LIFECYCLE_STATE_TYPES = [
  "",
  "subscriber",
  "lead",
  "marketingQualifiedLead",
  "salesQualifiedLead",
  "opportunity",
  "customer",
  "evangelist",
  "other"
];

export const COMPANY_BUSINESS_TYPES = [
  "",
  "Analyst",
  "Competitor",
  "Customer",
  "Integrator",
  "Investor",
  "Partner",
  "Press",
  "Prospect",
  "Reseller",
  "Other"
];

export const COMPANY_INDUSTRY_TYPES = [
  "",
  "Advertising/Public Relations",
  "Aerospace, Defense Contractors",
  "Agriculture",
  "Airlines",
  "Alcoholic Beverages",
  "Alternative Energy Production & Services",
  "Architectural Services",
  "Attorneys/Law Firms",
  "Automotive",
  "Banks",
  "Bars & Restaurants",
  "Books, Magazines & Newspapers",
  "Builders/General Contractors",
  "Business Services",
  "Car Manufacturers",
  "Coal Mining",
  "Colleges, Universities & Schools",
  "Commercial TV & Radio Stations",
  "Computer Software",
  "Construction",
  "Dairy",
  "Doctors & Other Health Professionals",
  "Education",
  "Energy & Natural Resources",
  "Finance, Insurance & Real Estate",
  "Food & Beverage",
  "Foundations, Philanthropists & Non-Profits",
  "Health",
  "Hotels, Motels & Tourism",
  "Insurance",
  "Internet",
  "Lawyers / Law Firms",
  "Meat processing & products",
  "Medical Supplies",
  "Mining",
  "Mortgage Bankers & Brokers",
  "Music Production",
  "Natural Gas Pipelines",
  "Nursing Homes/Hospitals",
  "Phone Companies",
  "Postal Unions",
  "Printing & Publishing",
  "Private Equity & Investment Firms",
  "Publishing & Printing",
  "Real Estate",
  "Retail Sales",
  "Schools/Education",
  "Sports, Professional",
  "Telecom Services & Equipment",
  "Textiles",
  "Tobacco",
  "Transportation",
  "TV / Movies / Music"
];

export const COMPANY_BASIC_INFOS = [
  "primaryName",
  "names",
  "size",
  "industry",
  "website",
  "plan",
  "primaryPhone",
  "primaryEmail",
  "leadStatus",
  "lifecycleState",
  "businessType",
  "description",
  "employees",
  "doNotDisturb"
];

export const PROBABILITY = {
  TEN: "10%",
  TWENTY: "20%",
  THIRTY: "30%",
  FOURTY: "40%",
  FIFTY: "50%",
  SIXTY: "60%",
  SEVENTY: "70%",
  EIGHTY: "80%",
  NINETY: "90%",
  WON: "Won",
  LOST: "Lost",
  ALL: [
    "10%",
    "20%",
    "30%",
    "40%",
    "50%",
    "60%",
    "70%",
    "80%",
    "90%",
    "Won",
    "Lost"
  ]
};
