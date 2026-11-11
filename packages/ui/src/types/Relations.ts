export interface IRelation {
  _id: string;
  entities: {
    contentType: string;
    contentId: string;
  }[];
}

export interface IRelationInput {
  entities: {
    contentType: string;
    contentId: string;
  }[];
}
