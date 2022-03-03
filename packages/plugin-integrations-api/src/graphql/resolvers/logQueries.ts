interface ICommonParams {
  action?: string | { $in: string[] };
  type?: string | { $in: string[] };
}

interface ILogQueryParams extends ICommonParams {
  start?: string;
  end?: string;
  userId?: string;
  page?: number;
  perPage?: number;
  objectId?: string | { $in: string[] };
  $or: any[];
  desc?: string;
}

export interface IFilter extends ICommonParams {
  createdAt?: any;
  createdBy?: string;
  description?: object;
}

const logQueries = {
  logs(_root, _params: ILogQueryParams) {
    return null;
  },
};

export default logQueries;
