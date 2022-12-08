import {
  DURATION_TYPES,
  FLOW_STATUSES,
  WORK_STATUSES
} from '../models/definitions/constants';
import { IFlowDocument, IJobDocument } from '../models/definitions/flows';
import {
  IJobReferDocument,
  IProductDocument,
  IProductsData
} from '../models/definitions/jobs';
import { IModels } from '../connectionResolver';
import { IProcess } from '../models/definitions/processes';
import { IWork } from '../models/definitions/works';
import { JOB_TYPES } from '../models/definitions/constants';
import { sendProductsMessage, sendSalesplansMessage } from '../messageBroker';

interface IListArgs {
  dayPlans: any[];
  date: Date;
  branchId: string;
  departmentId: string;
}

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
      noLatestJob: []
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
      .map(j => this.subFlowsById[j.config.jobReferId || '']);

    let products = (flow.jobs || [])
      .filter(j => j.config.productId)
      .map(j => this.subFlowsById[j.config.productId || '']);

    for (const subFlow of subFlows || []) {
      jobRefers = jobRefers.concat(
        (subFlow.jobs || [])
          .filter(j => j.config.jobReferId)
          .map(j => this.subFlowsById[j.config.jobReferId || ''])
      );

      products = products.concat(
        (subFlow.jobs || [])
          .filter(j => j.config.productId)
          .map(j => this.subFlowsById[j.config.productId || ''])
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
    dueDate: Date,
    productId: string,
    count: number,
    referInfos
  ) {
    return {
      flowId: flow._id,
      flow,
      dueDate,
      branchId: this.branchId,
      departmentId: this.departmentId,
      productId,
      quantity: count,
      status: 'string',
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

  private async createPerWork(
    flow: IFlowDocument,
    job: IJobDocument,
    count: number,
    dueDate: Date,
    dayPlan,
    timeId
  ) {
    const config = job.config;

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
        subFlow,
        subLatestJob,
        count,
        dueDate,
        dayPlan,
        timeId
      );
    }

    const newDueDate = this.calcTimeDiff(
      dueDate,
      config.durationType,
      config.duration
    );

    if (
      [JOB_TYPES.JOB, JOB_TYPES.ENDPOINT].includes(job.type) &&
      config.jobReferId
    ) {
      const jobRefer = this.jobRefersById[config.jobReferId];

      this.bulkCreateWorks.push({
        name: job.label,
        status: WORK_STATUSES.TODO,
        dueDate,
        startAt: newDueDate,
        endAt: dueDate,
        type: jobRefer.type,
        typeId: jobRefer._id,
        flowId: flow._id,
        count,
        intervalId: timeId,
        inBranchId: config.inBranchId,
        inDepartmentId: config.inDepartmentId,
        outBranchId: config.outBranchId,
        outDepartmentId: config.outDepartmentId,
        needProducts: (jobRefer.needProducts || []).map(np => ({
          ...np,
          quantity: np.quantity * count
        })),
        resultProducts: (jobRefer.resultProducts || []).map(np => ({
          ...np,
          quantity: np.quantity * count
        }))
      });
    }

    if (
      [JOB_TYPES.INCOME, JOB_TYPES.OUTLET, JOB_TYPES.MOVE].includes(job.type) &&
      config.productId
    ) {
      const product = this.productsById[config.productId];
      const needProducts: IProductsData[] = [];
      const resultProducts: IProductsData[] = [];

      const productsData = {
        _id: product._id,
        productId: product._id,
        quantity: count,
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

      this.bulkCreateWorks.push({
        name: job.label,
        status: WORK_STATUSES.TODO,
        dueDate,
        startAt: newDueDate,
        endAt: dueDate,
        type: job.type,
        typeId: product._id,
        flowId: flow._id,
        count,
        intervalId: timeId,
        inBranchId: config.inBranchId,
        inDepartmentId: config.inDepartmentId,
        outBranchId: config.outBranchId,
        outDepartmentId: config.outDepartmentId,
        needProducts,
        resultProducts
      });
    }

    if (this.bulkCreateWorks.length >= 1000) {
      await this.models.Works.insertMany(this.bulkCreateWorks);
      this.bulkCreateWorks = [];
    }

    const beforJobs = (flow.jobs || []).filter(j =>
      j.nextJobIds.includes(job.id)
    );

    if (beforJobs.length) {
      for (const beforeJob of beforJobs) {
        await this.createPerWork(
          flow,
          beforeJob,
          count,
          newDueDate,
          dayPlan,
          timeId
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

    let bulkCreateProcesses: IProcess[] = [];

    for (const dayPlan of this.dayPlans) {
      const { productId, values } = dayPlan;

      const flow = this.flowByProducId[productId];
      if (!flow) {
        this.result.noFlow.push(dayPlan._id);
        continue;
      }

      const referInfos = await this.getReferInfos(flow);

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

        bulkCreateProcesses.push(
          await this.getProcessData(flow, dueDate, productId, count, referInfos)
        );

        if (bulkCreateProcesses.length >= 100) {
          await this.models.Processes.insertMany(bulkCreateProcesses);
          bulkCreateProcesses = [];
        }

        const latestJob = (flow.jobs || []).find(
          j => !(j.nextJobIds || []).length
        );
        if (!latestJob) {
          this.result.noLatestJob.push(dayPlan._id);
          continue;
        }

        await this.createPerWork(
          flow,
          latestJob,
          count,
          dueDate,
          dayPlan,
          timeId
        );
      }

      this.result.success.push(dayPlan._id);
    }

    if (bulkCreateProcesses.length) {
      await this.models.Processes.insertMany(bulkCreateProcesses);
      bulkCreateProcesses = [];
    }

    if (this.bulkCreateWorks.length) {
      await this.models.Works.insertMany(this.bulkCreateWorks);
      this.bulkCreateWorks = [];
    }

    await this.sendStatus();
    return {};
  }
}
