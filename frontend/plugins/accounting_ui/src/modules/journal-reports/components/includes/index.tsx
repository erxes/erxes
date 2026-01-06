import React from 'react';
import { IGroupRule } from '../../types/reportsMap';
import { HandleMainAC } from './main/ac';
import { HandleMainACMore } from './main/acMore';
import { HandleMainTB } from './main/tb';
import { HandleInvCost } from './inventory/invCost';

export type CalcReportResult = {
  lastNode: JSX.Element;
  lastData?: any;
};

export type CalcReportHandler = (
  dic: any,
  groupRule: IGroupRule,
  attr: string,
) => CalcReportResult;

export type CalcReportProps = {
  dic: any;
  groupRule: IGroupRule;
  attr: string;
};

export const getCalcReportHandler = (report: string): CalcReportHandler => {
  const handlers: any = {
    ac: HandleMainAC,
    tb: HandleMainTB,
    invCost: HandleInvCost,
  };

  if (!handlers[report]) {
    return (_dic: any, _groupRule: IGroupRule, _attr: string) => ({
      lastNode: <></>,
      lastData: {},
    });
  }

  return handlers[report];
};

export const getRenderMoreHandler = (report: string, isMore: boolean) => {
  if (!isMore) {
    return;
  }
  const handlers: any = {
    ac: HandleMainACMore,
    tb: () => null,
  };

  return handlers[report];
};
