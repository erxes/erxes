export interface ISyncHistory {
  _id: string;
  type: string;
  contentType: string;
  contentId: string;
  createdAt: Date;
  createdBy: string;
  consumeData: string;
  consumeStr: string;
  sendData: string;
  sendStr: string;
  responseData: string;
  responseStr: string;
  error: string;
  content: string;
  createdUser: string;
}
