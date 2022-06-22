import { IJobReferDocument, IProductsData } from './../models/definitions/jobs';
import { IJob } from '../models/definitions/flows';

export const findLastAction = (
  jobs: IJob[],
  jobRefers: IJobReferDocument[],
  productId: string
) => {
  const lastJobs: IJob[] = [];

  for (const job of jobs) {
    if (!job.nextJobIds.length || job.nextJobIds.length === 0) {
      lastJobs.push(job);
    }
  }

  const lastJobIds = lastJobs.map(last => last.jobReferId);
  const lastJobRefers = jobRefers.filter(job => lastJobIds.includes(job._id));

  let resultProducts: IProductsData[] = [];
  for (const lastJobRefer of lastJobRefers) {
    const resultProduct = lastJobRefer.resultProducts || [];
    resultProducts = resultProducts.length
      ? [...resultProducts, ...(lastJobRefer.resultProducts || [])]
      : resultProduct;
  }

  const checkResult =
    resultProducts.find(pro => pro.productId === productId) ||
    ({} as IProductsData);

  const doubleCheckResult = Object.keys(checkResult ? checkResult : {}).length;

  if (doubleCheckResult) {
    let justLastJobRefer = {} as IJobReferDocument;
    for (const lastJobRefer of lastJobRefers) {
      const lastJobRefersIds = lastJobRefer.resultProducts.map(
        last => last.productId
      );
      justLastJobRefer = lastJobRefersIds.includes(checkResult.productId)
        ? lastJobRefer
        : ({} as IJobReferDocument);
    }

    const justLastJob = Object.keys(justLastJobRefer).length
      ? lastJobs.find(last => last.jobReferId === justLastJobRefer._id)
      : ({} as IJob);

    return {
      lastJob: justLastJob,
      lastJobs,
      flowStatus: doubleCheckResult ? true : false
    };
  } else {
    return {
      lastJob: {} as IJob,
      lastJobs,
      flowStatus: doubleCheckResult ? true : false
    };
  }
};
