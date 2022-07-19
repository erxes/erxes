import { IFlowDocument, IJob } from '../../../flow/types';
import { IJobRefer } from '../../../job/types';
import { IOverallWorkDocument } from '../../types';

export const calculateCount = (
  jobRefers: IJobRefer[],
  flows: IFlowDocument[],
  overallWorkDetail?: IOverallWorkDocument,
  type?: string
) => {
  const jobId = overallWorkDetail?.jobId;
  const resultProducts = overallWorkDetail?.resultProducts;

  const jobRefer = jobId
    ? jobRefers.find(jr => jr._id === jobId)
    : ({} as IJobRefer);

  const jobReferResultProducts = jobRefer ? jobRefer.resultProducts : [];
  const overallWorkResultProducts = resultProducts ? resultProducts : [];

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

    console.log(
      `calculate count: ${type}`,
      jobReferResultProducts,
      overallQnty,
      jobReferQnty,
      count
    );
  }

  return { count, jobRefer };
};
