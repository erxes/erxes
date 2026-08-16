import React from 'react';
import { IGroupRule } from '../../types/reportsMap';

export type CalcReportResult = {
  lastNode: React.ReactNode;
  lastData?: Record<string, unknown>;
};

export type CalcReportHandler = (
  dic: Record<string, unknown>,
  groupRule: IGroupRule,
  attr: string,
) => CalcReportResult;

export type CalcReportProps = {
  dic: Record<string, unknown>;
  groupRule: IGroupRule;
  attr: string;
};

export type RenderMoreProps = {
  moreData: Record<string, unknown>[];
  currentKey: string;
  nodeExtra?: Record<string, unknown>;
};

export type RenderMoreHandler = React.FC<RenderMoreProps>;
