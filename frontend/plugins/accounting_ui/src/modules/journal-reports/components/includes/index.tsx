import React from 'react';
import { debtCalcReportHandlers } from './handlers/debt';
import { fixedAssetCalcReportHandlers } from './handlers/fixedAsset';
import { fundCalcReportHandlers } from './handlers/fund';
import { inventoryCalcReportHandlers } from './handlers/inventory';
import {
  mainCalcReportHandlers,
  mainRenderMoreHandlers,
} from './handlers/main';
import {
  CalcReportHandler,
  RenderMoreHandler,
  RenderMoreProps,
} from './types';

export type {
  CalcReportHandler,
  CalcReportProps,
  CalcReportResult,
  RenderMoreProps,
} from './types';

const calcReportHandlers: Record<string, CalcReportHandler> = {
  ...mainCalcReportHandlers,
  ...fundCalcReportHandlers,
  ...debtCalcReportHandlers,
  ...inventoryCalcReportHandlers,
  ...fixedAssetCalcReportHandlers,
};

const renderMoreHandlers: Record<string, RenderMoreHandler> = {
  ...mainRenderMoreHandlers,
};

export const getCalcReport = (report: string): CalcReportHandler => {
  if (!calcReportHandlers[report]) {
    return (
      _dic: Record<string, unknown>,
      _groupRule,
      _attr: string,
    ) => ({
      lastNode: null,
      lastData: {},
    });
  }

  return calcReportHandlers[report];
};

export const getRenderMoreHandler = (
  report: string,
): React.FC<RenderMoreProps> => renderMoreHandlers[report] || (() => null);
