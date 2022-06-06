import React from 'react';
import { IEmailDelivery } from '@erxes/ui-engage/src/types';
import { QueryResponse } from '../types';

export interface IActivityLogYearMonthDoc {
  year: React.ReactNode;
  month: React.ReactNode;
}

export interface IActivityLogPerformerDetails {
  avatar: string;
  fullName: string;
  position: string;
}

export interface IActivityLogActionPerformer {
  _id: string;
  type: string;
  details: IActivityLogPerformerDetails;
}

export interface IActivityLog {
  _id: string;
  action: string;
  contentId: string;
  contentType: string;
  content: any;
  contentDetail: any;
  contentTypeDetail: any;
  createdAt: Date;
  createdBy: string;
  createdByDetail: any;
}

export interface IActivityLogsUser {
  date: IActivityLogYearMonthDoc;
  list: IActivityLog;
}

export interface IActivityLogYearMonth {
  year: number;
  month: number;
}

export interface IActivityLogForMonth {
  date: IActivityLogYearMonth;
  list: IActivityLog[];
}

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLog[];
  subscribeToMore: any;
} & QueryResponse;

export type EmailDeliveryDetailQueryResponse = {
  emailDeliveryDetail: IEmailDelivery;
  loading: boolean;
};

export type IActivityLogItemProps = {
  activity: IActivityLog;
};
