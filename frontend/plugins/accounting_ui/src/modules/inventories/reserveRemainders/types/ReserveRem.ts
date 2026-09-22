export interface IReserveRem {
  _id: string;
  branchId?: string;
  departmentId?: string;
  productId?: string;
  uom?: string;
  remainder?: number;
  createdAt?: Date;
  modifiedAt?: Date;

  product?: {
    _id: string;
    code: string;
    name: string;
  };
  branch?: {
    _id: string;
    code: string;
    title: string;
  };
  department?: {
    _id: string;
    code: string;
    title: string;
  };
  modifiedUser?: {
    _id: string;
    details?: {
      avatar?: string;
      fullName?: string;
    };
  };
}
