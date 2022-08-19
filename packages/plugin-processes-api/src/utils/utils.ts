import {
  IOverallWork,
  IOverallWorkDocument
} from './../models/definitions/overallWorks';
import { IFlowDocument } from './../models/definitions/flows';
import { IWork } from './../models/definitions/works';
import { IModels } from './../connectionResolver';
import {
  IJobReferDocument,
  IProduct,
  IProductsData
} from './../models/definitions/jobs';
import { IJobDocument } from '../models/definitions/flows';
import { sendProductsMessage } from '../messageBroker';

export const findLastJob = (
  jobs: IJobDocument[],
  jobRefers: IJobReferDocument[],
  productId: string,
  branchId: string,
  departmentId: string
) => {
  const lastJobs: IJobDocument[] = [];

  for (const job of jobs) {
    if (
      (!job.nextJobIds.length || job.nextJobIds.length === 0) &&
      job.outBranchId === branchId &&
      job.outDepartmentId === departmentId
    ) {
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
      : ({} as IJobDocument);

    return {
      lastJob: justLastJob,
      lastJobs,
      flowStatus: doubleCheckResult ? true : false
    };
  } else {
    return {
      lastJob: {} as IJobDocument,
      lastJobs,
      flowStatus: doubleCheckResult ? true : false
    };
  }
};

export const getJobRefers = (
  jobIds: string[],
  jobRefers: IJobReferDocument[]
) => {
  const chosenJobRefers = jobRefers.filter(job => jobIds.includes(job._id));

  return chosenJobRefers;
};

export const getLeftJobs = (jobs: IJobDocument[], jobIds: string[]) => {
  const leftJobs = jobs.filter(job => !jobIds.includes(job.id));

  return leftJobs;
};

export const getBeforeJobs = (leftJobs: IJobDocument[], jobId: string) => {
  const beforeJobs = leftJobs.filter(left => left.nextJobIds.includes(jobId));

  return beforeJobs;
};

export const initDocOverallWork = (work: IWork) => {
  const {
    jobId,
    flowId,
    outBranchId,
    outDepartmentId,
    inBranchId,
    inDepartmentId,
    needProducts,
    resultProducts,
    intervalId
  } = work;

  const doc: IOverallWork = {
    status: 'active',
    dueDate: new Date(),
    startAt: new Date(),
    endAt: new Date(),
    assignUserIds: [],
    intervalId,
    jobId,
    flowId,
    outBranchId,
    outDepartmentId,
    inBranchId,
    inDepartmentId,
    needProducts,
    resultProducts
  };

  return doc;
};

export const initDocWork = async (
  flow: IFlowDocument,
  jobRefer: IJobReferDocument,
  productId: string,
  count: string,
  subdomain: string,
  job?: IJobDocument,
  intervalId?: string
) => {
  const doc: IWork = {
    name: job?.label,
    status: 'new',
    dueDate: new Date(),
    startAt: new Date(),
    endAt: new Date(),
    jobId: job?.jobReferId || '',
    flowId: flow._id,
    productId,
    count,
    intervalId,
    inBranchId: job?.inBranchId,
    inDepartmentId: job?.inDepartmentId,
    outBranchId: job?.outBranchId,
    outDepartmentId: job?.outDepartmentId,
    needProducts: await initProducts(
      parseInt(count, 10),
      jobRefer.needProducts,
      subdomain
    ),
    resultProducts: await initProducts(
      parseInt(count, 10),
      jobRefer.resultProducts,
      subdomain
    )
  };

  return doc;
};

export const initProducts = async (
  count: number,
  inputProducts: IProductsData[],
  subdomain: string
) => {
  const productsCount =
    (await sendProductsMessage({
      subdomain,
      action: 'count',
      data: {},
      isRPC: true
    })) || null;

  const productsData =
    (await sendProductsMessage({
      subdomain,
      action: 'find',
      data: { limit: productsCount },
      isRPC: true
    })) || [];

  const response: IProductsData[] = [];
  for (const inputProduct of inputProducts) {
    const changedIProduct = inputProduct;
    const { quantity, uomId } = changedIProduct;
    const product: IProduct = productsData.find(
      p => p._id === changedIProduct.productId
    );

    if (
      Object.keys(product).includes('uomId') &&
      product.uomId &&
      product.uomId !== changedIProduct.uomId
    ) {
      const { subUoms } = product;
      const subUom = (subUoms || []).find(sub => sub.uomId === uomId);
      const { ratio } = subUom;

      changedIProduct.uomId = product.uomId || '';
      changedIProduct.quantity = quantity / ratio;
    }

    changedIProduct.quantity = (changedIProduct.quantity || 1) * count;
    response.push(changedIProduct);
  }

  return response;
};

export const overallWorksAdd = async (doc: IOverallWork, models: IModels) => {
  const overallWork = await models.OverallWorks.createOverallWork(doc);

  // await putCreateLog(
  //   models,
  //   subdomain,
  //   {
  //     type: MODULE_NAMES.OVERALWORK,
  //     newData: {
  //       ...doc
  //     },
  //     object: overallWork
  //   },
  //   user
  // );

  return overallWork;
};

export const overallWorksUpdate = async (
  overalWork: IOverallWorkDocument,
  work: IWork,
  models: IModels
) => {
  const needProducts: IProductsData[] = overalWork.needProducts || [];
  const resultProducts: IProductsData[] = overalWork.resultProducts || [];

  const wNeedProducts: IProductsData[] = work.needProducts || [];
  const wResultProducts: IProductsData[] = work.resultProducts || [];

  const updatedNeedProducts: IProductsData[] = [];
  const updatedResultProducts: IProductsData[] = [];

  for await (const need of needProducts) {
    const wNeedProduct =
      wNeedProducts.find(wNeed => wNeed._id === need._id) ||
      ({} as IProductsData);
    need.quantity = need.quantity + wNeedProduct.quantity || 0;
    updatedNeedProducts.push(need);
  }

  for await (const result of resultProducts) {
    const wResultProduct =
      wResultProducts.find(wNeed => wNeed._id === result._id) ||
      ({} as IProductsData);
    result.quantity = result.quantity + wResultProduct.quantity || 0;
    updatedResultProducts.push(result);
  }

  await models.OverallWorks.updateOne(
    { _id: overalWork._id },
    {
      $set: {
        needProducts: updatedNeedProducts,
        resultProducts: updatedResultProducts
      }
    }
  );

  const updated = await models.OverallWorks.findOne({ _id: overalWork._id });

  return updated;
};

export const worksAdd = async (doc: IWork, models: IModels) => {
  const work = await models.Works.createWork(doc);

  // await putCreateLog(
  //   models,
  //   subdomain,
  //   {
  //     type: MODULE_NAMES.WORK,
  //     newData: {
  //       ...doc
  //     },
  //     object: work
  //   },
  //   user
  // );

  return work;
};

export const recursiveCatchBeforeJobs = async (
  recursiveJobs: IJobDocument[],
  leftJobs,
  level,
  params,
  intervalId,
  subdomain: string
) => {
  console.log('Starting recursive ...');

  console.log('level:', level);
  leftJobs =
    getLeftJobs(
      leftJobs,
      recursiveJobs.map(before => before.id)
    ) || [];

  console.log(
    'left jobs: ',
    level,
    leftJobs.map(e => e.label),
    leftJobs.length
  );

  const totalBeforeJobsRecursive: any[] = [];

  for (const recursiveJob of recursiveJobs) {
    const { flow, productId, count, jobRefers, models } = params;

    const lastJobRefer = getJobRefers(
      [recursiveJob?.jobReferId || ''],
      jobRefers
    );

    const doc: IWork = await initDocWork(
      flow,
      lastJobRefer[0],
      productId,
      count,
      subdomain,
      recursiveJob,
      intervalId
    );

    await worksAdd(doc, models);

    const beforeJobsRecursive = getBeforeJobs(leftJobs, recursiveJob.id);

    console.log(
      'beforeJobsRecursive: ',
      level,
      beforeJobsRecursive.map(e => e.label),
      beforeJobsRecursive.length
    );

    if (beforeJobsRecursive.length > 0) {
      totalBeforeJobsRecursive.push(beforeJobsRecursive);
    }
  }

  if (totalBeforeJobsRecursive.length === 0) {
    console.log('Finished before jobs .');
    console.log('Finished before jobs ..');
    console.log('Finished before jobs ...');
  } else {
    let levelCounter = 1;

    let checkJobFrequentlyIds: string[] = [];

    for (const beforeJobsRecursive of totalBeforeJobsRecursive) {
      let checkTempIds = beforeJobsRecursive.map(beforeJob => beforeJob.id);
      checkTempIds = checkTempIds.sort();

      if (
        checkJobFrequentlyIds.length === 0 ||
        JSON.stringify(checkTempIds) !== JSON.stringify(checkJobFrequentlyIds)
      ) {
        console.log(
          'Compare1 ... checkTempIds: ',
          checkTempIds,
          'checkJobFrequentlyIds: ',
          checkJobFrequentlyIds
        );

        checkJobFrequentlyIds = checkTempIds;
        recursiveJobs = beforeJobsRecursive;
        leftJobs = recursiveCatchBeforeJobs(
          recursiveJobs,
          leftJobs,
          level + levelCounter++,
          params,
          intervalId,
          subdomain
        );
      }
    }
  }

  return leftJobs;
};
