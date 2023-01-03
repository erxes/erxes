import {
  DURATION_TYPES,
  FLOW_STATUSES,
  WORK_STATUSES
} from '../models/definitions/constants';
import { IFlowDocument, IJob } from '../models/definitions/flows';
import {
  IJobReferDocument,
  IProductDocument,
  IProductsData
} from '../models/definitions/jobs';
import { IModels } from '../connectionResolver';
import { IWork } from '../models/definitions/works';
import { JOB_TYPES } from '../models/definitions/constants';
import { sendProductsMessage, sendSalesplansMessage } from '../messageBroker';
import { getRatio } from './utils';

interface IListArgs {
  dayPlans: any[];
  date: Date;
  branchId: string;
  departmentId: string;
}

const remover = async (models, branchId, departmentId, productId, date) => {
  const oldProcesses = await models.Processes.find({
    branchId,
    departmentId,
    productId,
    date
  }).lean();

  const oldProcessIds = oldProcesses.map(p => p._id);
  await models.Works.deleteMany({ processId: { $in: oldProcessIds } });
  await models.Processes.deleteMany({ _id: { $in: oldProcessIds } });
};

export class consumeSalesPlans {
  public models: IModels;
  public subdomain: string;
  private result: { [key: string]: string[] };

  private dayPlans: any[];
  private date: Date;
  private branchId: string;
  private departmentId: string;

  private flows: IFlowDocument[] = [];
  private flowByProducId: { [_id: string]: IFlowDocument } = {};
  private jobRefersById: { [_id: string]: IJobReferDocument } = {};
  private subFlowsById: { [_id: string]: IFlowDocument } = {};
  private productsById: { [_id: string]: IProductDocument } = {};

  private bulkCreateWorks: IWork[] = [];

  constructor(models: IModels, subdomain: string, params: IListArgs) {
    this.models = models;
    this.subdomain = subdomain;
    this.dayPlans = params.dayPlans;
    this.date = params.date;
    this.branchId = params.branchId;
    this.departmentId = params.departmentId;

    this.result = {
      noTimeFrames: [],
      noFlow: [],
      success: [],
      noLatestJob: [],
      wrongUom: []
    };
  }

  sendStatus = async () => {
    for (const key of Object.keys(this.result)) {
      if (this.result[key].length) {
        await sendSalesplansMessage({
          subdomain: this.subdomain,
          action: 'dayPlans.updateStatus',
          data: { _ids: this.result[key], status: key }
        });
      }
    }
  };

  private async getFlows() {
    const productIds = this.dayPlans.map(d => d.productId);
    const flows = await this.models.Flows.find({
      status: FLOW_STATUSES.ACTIVE,
      flowValidation: '',
      productId: { $in: productIds },
      latestBranchId: this.branchId,
      latestDepartmentId: this.departmentId
    }).lean();

    const flowByProducId = {};
    for (const flow of flows) {
      flowByProducId[flow.productId] = flow;
    }

    this.flows = flows;
    this.flowByProducId = flowByProducId;
  }

  private async prepareDatas() {
    let cJobReferIds: string[] = [];
    let cSubFlowIds: string[] = [];
    let cProductIds: string[] = [];

    for (const flow of this.flows) {
      for (const job of flow.jobs || []) {
        const config = job.config;

        if (config.subFlowId) {
          cSubFlowIds.push(config.subFlowId);
        }

        if (config.jobReferId) {
          cJobReferIds.push(config.jobReferId);
        }

        if (config.productId) {
          cProductIds.push(config.productId);
        }
      }
    }

    const subFlows = await this.models.Flows.find({
      _id: { $in: cSubFlowIds }
    }).lean();

    for (const flow of subFlows) {
      for (const job of flow.jobs || []) {
        const config = job.config;
        if (config.jobReferId) {
          cJobReferIds.push(config.jobReferId);
        }

        if (config.productId) {
          cProductIds.push(config.productId);
        }
      }
    }

    const jobRefers = await this.models.JobRefers.find({
      _id: { $in: cJobReferIds }
    }).lean();

    for (const jobRefer of jobRefers) {
      cProductIds = cProductIds.concat(
        (jobRefer.needProducts || []).map(pd => pd.productId)
      );
      cProductIds = cProductIds.concat(
        (jobRefer.resultProducts || []).map(pd => pd.productId)
      );
    }

    const limit = await sendProductsMessage({
      subdomain: this.subdomain,
      action: 'count',
      data: { query: { _id: { $in: cProductIds } } },
      isRPC: true,
      defaultValue: 0
    });

    const products = await sendProductsMessage({
      subdomain: this.subdomain,
      action: 'find',
      data: { query: { _id: { $in: cProductIds } }, limit },
      isRPC: true,
      defaultValue: []
    });

    const jobRefersById = {};
    jobRefers.forEach(jr => (jobRefersById[jr._id] = jr));

    const subFlowsById = {};
    subFlows.forEach(sf => (subFlowsById[sf._id] = sf));

    const productsById = {};
    products.forEach(pr => (productsById[pr._id] = pr));

    this.jobRefersById = jobRefersById;
    this.subFlowsById = subFlowsById;
    this.productsById = productsById;
  }

  private async getReferInfos(flow: IFlowDocument) {
    const subFlows = (flow.jobs || [])
      .filter(j => j.config.subFlowId)
      .map(j => this.subFlowsById[j.config.subFlowId || '']);

    let jobRefers = (flow.jobs || [])
      .filter(j => j.config.jobReferId)
      .map(j => this.jobRefersById[j.config.jobReferId || '']);

    let products = (flow.jobs || [])
      .filter(j => j.config.productId)
      .map(j => this.productsById[j.config.productId || '']);

    for (const subFlow of subFlows || []) {
      jobRefers = jobRefers.concat(
        (subFlow.jobs || [])
          .filter(j => j.config.jobReferId)
          .map(j => this.jobRefersById[j.config.jobReferId || ''])
      );

      products = products.concat(
        (subFlow.jobs || [])
          .filter(j => j.config.productId)
          .map(j => this.productsById[j.config.productId || ''])
      );
    }
    return {
      subFlows,
      jobRefers,
      products
    };
  }

  private async getProcessData(
    flow: IFlowDocument,
    date: Date,
    productId: string,
    uomId: string,
    referInfos
  ) {
    return {
      flowId: flow._id,
      flow,
      date,
      uomId,
      branchId: this.branchId,
      departmentId: this.departmentId,
      productId,
      status: 'new',
      origin: 'plan',
      isSub: false,
      referInfos
    };
  }

  private calcTimeDiff(date: Date, durationType: string, duration: number) {
    let diff = 0;
    switch (durationType) {
      case DURATION_TYPES.MINUT:
        diff = duration * 1000 * 60;
        break;
      case DURATION_TYPES.HOUR:
        diff = duration * 1000 * 60 * 60;
        break;
      case DURATION_TYPES.DAY:
        diff = duration * 1000 * 60 * 60 * 24;
        break;
      case DURATION_TYPES.MONTH:
        diff = duration * 1000 * 60 * 60 * 24 * 30;
        break;
    }

    return new Date(date.getTime() - diff);
  }

  private calcUomQuantity(
    product: IProductDocument,
    needData: IProductsData,
    resultData: IProductsData
  ) {
    const allUomIds = [
      ...(product.subUoms || []).map(su => su.uomId),
      product.uomId
    ];

    if (
      !allUomIds.includes(needData.uomId) ||
      !allUomIds.includes(resultData.uomId)
    ) {
      return;
    }

    if (needData.uomId === resultData.uomId) {
      return needData.quantity;
    }

    const needRatio = getRatio(product, needData.uomId);
    const resultRatio = getRatio(product, resultData.uomId);

    if (!needRatio || !resultRatio) {
      return;
    }

    return (needData.quantity / needRatio) * resultRatio;
  }

  private async createPerWork(
    processId: string,
    flow: IFlowDocument,
    job: IJob,
    dueDate: Date,
    dayPlan,
    timeId,
    needDatas: IProductsData[]
  ) {
    const config = job.config;
    const newDueDate = this.calcTimeDiff(
      dueDate,
      config.durationType,
      config.duration
    );
    let calcedNeedDatas = needDatas;

    if (job.type === JOB_TYPES.FLOW && config.subFlowId) {
      const subFlow = this.subFlowsById[config.subFlowId || ''];
      const subLatestJob = (subFlow.jobs || []).find(
        j => !(j.nextJobIds || []).length
      );
      if (!subLatestJob) {
        this.result.noSubLatestJob.push(dayPlan._id);
        return;
      }

      await this.createPerWork(
        processId,
        subFlow,
        subLatestJob,
        dueDate,
        dayPlan,
        timeId,
        needDatas
      );
    } else {
      let needProducts: IProductsData[] = [];
      let resultProducts: IProductsData[] = [];
      let typeId = '';

      if (
        [JOB_TYPES.JOB, JOB_TYPES.ENDPOINT].includes(job.type) &&
        config.jobReferId
      ) {
        const jobRefer = this.jobRefersById[config.jobReferId];
        typeId = jobRefer._id;

        needProducts = jobRefer.needProducts || [];
        resultProducts = jobRefer.resultProducts || [];
      }

      if (
        [JOB_TYPES.INCOME, JOB_TYPES.OUTLET, JOB_TYPES.MOVE].includes(
          job.type
        ) &&
        config.productId
      ) {
        const product = this.productsById[config.productId];
        typeId = product._id;

        const productsData = {
          _id: product._id,
          productId: product._id,
          quantity: 1,
          uomId: product.uomId || ''
        };

        switch (job.type) {
          case JOB_TYPES.INCOME:
            resultProducts.push(productsData);
            break;
          case JOB_TYPES.OUTLET:
            needProducts.push(productsData);
            break;
          case JOB_TYPES.MOVE:
            resultProducts.push(productsData);
            needProducts.push(productsData);
            break;
        }
      }

      let calcedCount = 0;
      for (const resultData of resultProducts || []) {
        const needData = needDatas.find(
          nd => nd.productId === resultData.productId
        );
        if (!needData) {
          continue;
        }

        const product = this.productsById[resultData.productId];
        const calcedUom = this.calcUomQuantity(product, needData, resultData);
        if (calcedUom === undefined) {
          this.result.wrongUom.push(dayPlan._id);
          return;
        }

        if (calcedCount < calcedUom) {
          calcedCount = calcedUom;
        }
      }

      calcedNeedDatas = (needProducts || []).map(snd => ({
        ...snd,
        quantity: snd.quantity * calcedCount
      }));

      this.bulkCreateWorks.push({
        name: job.label,
        processId,
        status: WORK_STATUSES.TODO,
        dueDate,
        startAt: newDueDate,
        endAt: dueDate,
        type: job.type,
        typeId,
        origin: 'plan',
        flowId: flow._id,
        count: calcedCount,
        intervalId: timeId,
        inBranchId: config.inBranchId,
        inDepartmentId: config.inDepartmentId,
        outBranchId: config.outBranchId,
        outDepartmentId: config.outDepartmentId,
        needProducts: calcedNeedDatas,
        resultProducts: (resultProducts || []).map(rp => ({
          ...rp,
          quantity: rp.quantity * calcedCount
        }))
      });
    }

    if (this.bulkCreateWorks.length >= 1000) {
      await this.models.Works.insertMany(this.bulkCreateWorks);
      this.bulkCreateWorks = [];
    }

    const beforeJobs = (flow.jobs || []).filter(j =>
      j.nextJobIds.includes(job.id)
    );

    if (beforeJobs.length) {
      for (const beforeJob of beforeJobs) {
        await this.createPerWork(
          processId,
          flow,
          beforeJob,
          newDueDate,
          dayPlan,
          timeId,
          calcedNeedDatas
        );
      }
    }
  }

  public async run(): Promise<any> {
    const dayPlanIds = this.dayPlans.map(dp => dp._id);

    await this.getFlows();
    await this.prepareDatas();
    const timeframes = await sendSalesplansMessage({
      subdomain: this.subdomain,
      action: 'timeframes.find',
      data: { branchId: this.branchId, departmentId: this.departmentId },
      isRPC: true
    });

    if (!timeframes.length) {
      this.result.noTimeFrames = dayPlanIds;
      return await this.sendStatus();
    }

    const timesById = {};
    for (const time of timeframes) {
      timesById[time._id] = time;
    }

    for (const dayPlan of this.dayPlans) {
      const { productId, values, uomId } = dayPlan;

      const flow = this.flowByProducId[productId];
      if (!flow) {
        this.result.noFlow.push(dayPlan._id);
        continue;
      }

      const referInfos = await this.getReferInfos(flow);
      await remover(
        this.models,
        this.branchId,
        this.departmentId,
        productId,
        this.date
      );
      const process = await this.models.Processes.createProcess(
        await this.getProcessData(flow, this.date, productId, uomId, referInfos)
      );

      for (const value of values) {
        const { timeId, count } = value;
        if (!count) {
          continue;
        }

        let time = timesById[timeId];

        if (!time) {
          time = timeframes[0];
        }

        const dueDate = new Date(new Date(this.date).setHours(time.startTime));

        const latestJob = (flow.jobs || []).find(
          j => !(j.nextJobIds || []).length
        );

        if (!latestJob) {
          this.result.noLatestJob.push(dayPlan._id);
          continue;
        }

        const needDatas = [
          {
            _id: Math.random().toString(),
            productId,
            quantity: count,
            uomId: dayPlan.uomId || this.productsById[productId].uomId
          }
        ];

        await this.createPerWork(
          process._id,
          flow,
          latestJob,
          dueDate,
          dayPlan,
          timeId,
          needDatas
        );
      }

      this.result.success.push(dayPlan._id);
    }

    if (this.bulkCreateWorks.length) {
      await this.models.Works.insertMany(this.bulkCreateWorks);
      this.bulkCreateWorks = [];
    }

    await this.sendStatus();
    return {};
  }
}

export const removeFromSalesPlans = async (
  models: IModels,
  dayPlans: any[]
) => {
  const result: string[] = [];
  for (const dayPlan of dayPlans) {
    await remover(
      models,
      dayPlan.branchId,
      dayPlan.departmentId,
      dayPlan.productId,
      dayPlan.date
    );
    result.push(dayPlan._id);
  }
  return result;
};
