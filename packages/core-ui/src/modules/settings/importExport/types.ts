import { ISubSegment } from '@erxes/ui-segments/src/types';
import { QueryResponse } from '@erxes/ui/src/types';
import { IUser } from 'modules/auth/types';
import { IAttachment } from '@erxes/ui/src/types';

export interface IContentType {
  text: string;
  contentType: string;
  icon: string;
  skipFilter: boolean;
}

export interface IColumnWithChosenField {
  [key: string]: {
    [key: string]: {
      value: string
    }
  }[]
}

export interface IImportCreate {
  contentTypes?: IContentType[];
  files?: IAttachment;
  columnsConfig?: IColumnWithChosenField;
  importName?: string;
  associatedContentType?: string;
  associatedField?: string;
}

export interface IImportHistory {
  _id: string;
  success: string;
  updated: string;
  failed: string;
  total: string;
  contentTypes: IContentType[];
  date: Date;
  user: IUser;
  status: string;
  percentage: number;
  name?: string;
  errorMsgs: string[];
  error: string;
  attachments?: IAttachment[];
  removed?: string[];
}

export interface IImportHistoryItem {
  list: IImportHistory[];
  count: number;
}

export interface IImportHistoryContentType {
  type: 'core' | 'plugin';
  contentType: string;
  icon: string;
}

export interface IImportColumn {
  [key: string]: string[]
}

export interface IExportHistory {
  _id: string;
  success: string;
  total: string;
  name: string;
  contentType: string;
  date: Date;
  status: string;
  percentage: number;
  removed: string[];
  user: IUser;
  error: string;
  exportLink: string;
  uploadType?: string;
}

export interface IExportHistoryItem {
  list: IExportHistory[];
  count: number;
}
export interface IExportHistoryContentType {
  contentType: string;
}

export interface IExportFilter {
  _id?: string;
  name?: string;
  subOf?: string;
  color?: string;
  conditionsConjunction?: string;
  contentType?: string;
  conditionSegments?: ISubSegment[];
  config?: JSON;
  shouldWriteActivityLog?: boolean;
}
export interface IExportHistoryDoc {
  contentType: string;
  columnsConfig?: string[];
  segmentData?: JSON | string;
  name?: string;
}
export interface IExportField {
  checked?: boolean;
  label: string;
  name: string;
  order?: number;
  type: string;
  _id?: string;
}

// query types

export type ImportHistoriesQueryResponse = {
  importHistories: IImportHistoryItem;
  stopPolling: () => any;
} & QueryResponse;

export type ImportHistoryGetColumnsQueryResponse = {
  importHistoryGetColumns: IImportColumn;
} & QueryResponse;

export type ImportHistoryGetDuplicatedHeadersQueryResponse = {
  importHistoryGetDuplicatedHeaders: {
    attachmentNames: string[];
  };
} & QueryResponse;

export type ImportHistoryDetailQueryResponse = {
  importHistoryDetail: IImportHistory;
  subscribeToMore: any;
  error: any;
  stopPolling: () => any;
} & QueryResponse;

export type FieldsCombinedByContentTypeQueryResponse = {
  fieldsCombinedByContentType: IExportField[];
} & QueryResponse;

export type ExportHistoriesQueryResponse = {
  exportHistories: IExportHistoryItem;
  stopPolling: () => any;
} & QueryResponse;

export type HistoryGetTypesQueryResponse = {
  historyGetTypes: IContentType[];
} & QueryResponse;

export type ExportHistoryDetailQueryResponse = {
  importHistoryDetail: IExportHistory;
  subscribeToMore: any;
  error: any;
  stopPolling: () => any;
} & QueryResponse;

// mutation types

export type RemoveMutationResponse = {
  importHistoriesRemove: (params: {
    variables: { _id: string; contentType: string };
  }) => Promise<any>;
};

export type ImportHistoryCreateMutationResponse = {
  importHistoriesCreate: (params: {
    variables: { doc: IImportCreate };
  }) => Promise<any>;
};

export type ExportHistoryCreateMutationResponse = {
  exportHistoriesCreate: (params: {
    variables: { doc: IExportHistoryDoc };
  }) => Promise<any>;
};

export type CancelMutationResponse = {
  importCancel: (params: { variables: { _id: string } }) => Promise<any>;
};
