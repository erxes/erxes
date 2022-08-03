import { IProduct } from '@erxes/ui-products/src/types';
import { IFlowDocument } from '../../../flow/types';
import { IJobRefer, IProductsData } from '../../../job/types';
import { IOverallWorkDocument } from '../../types';

export const calculateCount = (
  jobRefers: IJobRefer[],
  flows: IFlowDocument[],
  overallWorkDetail?: IOverallWorkDocument
) => {
  const jobId = overallWorkDetail?.jobId;
  const resultProducts = overallWorkDetail?.resultProducts;

  const jobRefer = jobId
    ? jobRefers.find(jr => jr._id === jobId)
    : ({} as IJobRefer);

  const jobReferResultProducts: IProductsData[] = jobRefer
    ? jobRefer.resultProducts || []
    : [];
  const jobReferNeedProducts: IProductsData[] = jobRefer
    ? jobRefer.needProducts || []
    : [];

  const overallWorkResultProducts = resultProducts ? resultProducts : [];
  console.log('jobReferResultProducts on common:', jobReferResultProducts);

  for (const jobReferResultProduct of jobReferResultProducts || []) {
    const { uomId, quantity } = jobReferResultProduct;
    const product: IProduct = jobReferResultProduct.product || ({} as IProduct);
    const { subUoms } = product;
    const subUom = subUoms && subUoms.find(su => su.uomId === uomId);
    const productUomId = product.uomId || '';
    const ratio: number = (subUom && Number(String(subUom.ratio))) || 1;

    if (uomId !== productUomId) {
      jobReferResultProduct.uomId = productUomId;
      jobReferResultProduct.quantity = quantity / ratio;
    }
  }

  for (const jobReferNeedProduct of jobReferNeedProducts || []) {
    const { uomId, quantity } = jobReferNeedProduct;
    const product: IProduct = jobReferNeedProduct.product || ({} as IProduct);
    const { subUoms } = product;
    const subUom = subUoms && subUoms.find(su => su.uomId === uomId);
    const productUomId = product.uomId || '';
    const ratio: number = (subUom && Number(String(subUom.ratio))) || 1;

    if (uomId !== productUomId) {
      jobReferNeedProduct.uomId = productUomId;
      jobReferNeedProduct.quantity = quantity / ratio;
    }
  }

  let count = 0;
  if (
    (jobReferResultProducts || []).length > 0 &&
    overallWorkResultProducts.length > 0
  ) {
    const overallQnty = overallWorkResultProducts[0].quantity || 1;
    const jobReferQnty = jobReferResultProducts?.length
      ? jobReferResultProducts[0].quantity
      : 1;
    count = overallQnty / jobReferQnty;
  }

  return { count, jobRefer };
};
