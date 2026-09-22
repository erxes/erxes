export interface IKhanbankConfigsItem {
  _id: string;
  name: string;
  description: string;
  consumerKey: string;
  secretKey: string;
}

export type ConfigsListQueryResponse = {
  khanbankConfigsList: {
    list: IKhanbankConfigsItem[];
    totalCount: number;
  };

  loading: boolean;
  refetch: () => void;
};
