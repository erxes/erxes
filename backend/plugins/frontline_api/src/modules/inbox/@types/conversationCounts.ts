export interface ICountBy {
  [index: string]: number;
}

export interface IUserArgs {
  _id: string;
  code?: string;
  starredConversationIds?: string[];
}
