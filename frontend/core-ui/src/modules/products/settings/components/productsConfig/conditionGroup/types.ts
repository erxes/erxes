export interface IProductCondition {
  _id: string;
  name: string;
}

export interface IProductConditionGroup {
  _id: string;
  name: string;
  description?: string | null;
  conditions: IProductCondition[];
}
