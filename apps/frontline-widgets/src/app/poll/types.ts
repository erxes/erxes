export type TPollWidgetSettings = {
  poll_id: string;
  channel_id: string;
};

export type TPollWidgetOption = {
  _id: string;
  text: string;
  order?: number;
};

export type TPollWidget = {
  _id: string;
  code?: string;
  title: string;
  question: string;
  allowMultiselect?: boolean;
  options: TPollWidgetOption[];
};

export type TPollConnectResponse = {
  widgetsPollConnect: {
    poll: TPollWidget | null;
    votedOptionIds: string[];
  };
};

export type TPollSubmitResponse = {
  widgetsPollSubmit: {
    status: string;
    customerId?: string;
    conversationId?: string;
  };
};
