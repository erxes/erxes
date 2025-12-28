import React from "react";
import { IGroupRule } from "../../types/reportsMap";
import { HandleMainAC } from "./main/ac";
import { HandleMainACMore } from "./main/acMore";
import { HandleMainTB } from "./main/tb";

export type CalcReportResult = {
  lastNode: JSX.Element;
  lastData?: any;
};

export type CalcReportHandler = (
  dic: any,
  groupRule: IGroupRule,
  attr: string
) => CalcReportResult;

export type CalcReportProps = {
  dic: any;
  groupRule: IGroupRule;
  attr: string;
}

export const getCalcReportHandler = (report: string): CalcReportHandler => {
  const handlers: any = {
    ac: HandleMainAC,
    tb: HandleMainTB,
  };

  if (!handlers[report]) {
    return (_dic: any, _groupRule: IGroupRule, _attr: string) => ({ lastNode: <></>, lastData: {} })
  }

  return handlers[report];
}

export type RenderMoreProps = {
  moreData: any[];
  currentKey: string;
  nodeData: any;
};

export const getRenderMoreHandler = (report: string): React.FC<RenderMoreProps> => {
  const handlers: any = {
    ac: HandleMainACMore,
    tb: () => (<></>),
  };

  return handlers[report] || <></>;
}
