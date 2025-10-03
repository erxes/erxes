export interface IRelation {
  _id: string;
  entities: {
    contentType: string;
    contentId: string;
  }[];
}
