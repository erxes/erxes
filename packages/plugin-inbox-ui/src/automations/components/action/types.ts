import { IAttachment } from "@erxes/ui/src/types";
export type Message = {
  _id: string;
  type: string;
  buttons: any[];
  image: string;
  cards: string;
  quickReplies: any[];
  text: string;
  audio: string;
  video: string;
  attachments: IAttachment[];
  input: any;
};
