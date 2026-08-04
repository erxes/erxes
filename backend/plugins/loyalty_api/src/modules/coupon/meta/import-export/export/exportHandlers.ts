import {
  TExportHandlers,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { getCouponExportHeaders } from './getCouponExportHeaders';
import { getCouponExportData } from './getCouponExportData';

const couponExportMap = {
  coupon: {
    getExportHeaders: getCouponExportHeaders,
    getExportData: getCouponExportData,
  },
};

export const couponExportHandlers: TExportHandlers = {
  getExportHeaders: async (data: any, ctx: IImportExportContext) => {
    const collectionName = data?.collectionName ?? data?.data?.collectionName;
    const handler =
      couponExportMap[collectionName as keyof typeof couponExportMap]
        ?.getExportHeaders;
    if (!handler)
      throw new Error(`Export headers handler not found for ${collectionName}`);
    return handler(data, ctx);
  },
  getExportData: async (args: any, ctx: IImportExportContext) => {
    const collectionName = args?.collectionName ?? args?.data?.collectionName;
    const handler =
      couponExportMap[collectionName as keyof typeof couponExportMap]
        ?.getExportData;
    if (!handler)
      throw new Error(`Export handler not found for ${collectionName}`);
    return handler(args, ctx);
  },
};
