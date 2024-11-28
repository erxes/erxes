export type Result = { [key: string]: string | number | undefined };
export type BoardItemsFilter = {
    _id?: { $in: string[] };
};
type CreatedInfo = {
    _id: string;
    type: string;
    validation: string;
    text: string;
    value: string | Date;
};
export type MessageData = {
    datas: any;
    createdInfo: CreatedInfo;
};
export type  SelectionConfig = {
    queryName: string;
    labelField: string;
};
export type ConvsSelector = | { integrationId: string } | { _id: { $in: string[] } };
export type IntegrationSelector = {
    kind: "lead";
    isActive: boolean;
    formId?: string;
    tagIds?: string[];
    contentTypeIds?: string[];
};
export type Filter = {
    formFieldId: string;
    operator: "eq" | "c" | "gte" | "lte";
    value: any;
};
export type SubmissionFilter = {
    formFieldId: string;
    value: any;
};
export type Query = {
    contentType: string;
    isDefinedByErxes: boolean;
    validation?: string | null;
};
export type OrderQuery = {
    order: {
      $regex: RegExp;
    };
}
export type Doc = {
    code : string;
};
export type Action = {
    type: string;
    [key: string]: any;
};  
export type Webhook = {
    _id: string;
    actions: Action[];
};
export type Item = {
    categoryId?: string;
    tagIds?: string[];
    barcodes?: string[];
    uom?: string;
    createdAt?: string | Date;
    [key: string]: any;
};
export type QueryParams = {
    page: number;
    perPage: number;
};
export type Docs = {
    [key: string]: string | number;
};
export type Objects = {
    code?: string;
};
interface CustomFieldData {
    field: string;
    value: string;
};
export type SubUom = {
    id: number;
    uom: string;
    ratio: number;
  }
export type ProductDoc = {
    customFieldsData: CustomFieldData[];
    categoryId?: string;
    tagIds?: string[];
    barcodes?: string[];
    uom?: string;
    subUoms?: SubUom[];
    [key: string]: any;
  }