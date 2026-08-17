export type TFacebookSentPart =
  | { type: 'text'; text: string }
  | {
      type: 'button_template';
      text: string;
      buttons: { title: string; url?: string | null }[];
    }
  | { type: 'quick_replies'; text: string; quick_replies: { title: string }[] }
  | {
      type: 'carousel';
      elements: {
        title: string;
        subtitle?: string;
        picture?: string;
        buttons: { title: string; url?: string | null }[];
      }[];
    }
  | { type: 'file'; url: string };

export type TFacebookSentMessage = {
  key: string;
  order: number;
  mid?: string;
  createdAt?: string;
  parts: TFacebookSentPart[];
  // Rendered by the engine when the message has no structured parts recorded
  content?: string;
};
