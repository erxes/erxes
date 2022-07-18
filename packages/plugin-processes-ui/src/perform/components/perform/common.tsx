import { IFlowDocument, IJob } from '../../../flow/types';
import { IJobRefer } from '../../../job/types';
import { IOverallWorkDocument } from '../../types';

export const calculateCount = (
  jobRefers: IJobRefer[],
  flows: IFlowDocument[],
  overallWorkDetail?: IOverallWorkDocument,
  type?: string
) => {
  const flowId = overallWorkDetail?.flowId;
  const jobId = overallWorkDetail?.jobId;
  const resultProducts = overallWorkDetail?.resultProducts;

  const flow = flows.find(f => f._id === flowId);
  const flowJobs: IJob[] | undefined = flow?.jobs;
  const flowJob: IJob =
    (flowJobs && flowJobs.find(fj => fj.id === jobId)) || ({} as IJob);
  const jobReferId = flowJob?.jobReferId || '';
  const jobRefer =
    jobReferId && jobRefers
      ? jobRefers.find(jr => jr._id === jobReferId)
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
