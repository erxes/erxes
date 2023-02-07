import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { sendCardsMessage } from '../messageBroker';
import { sendFormsMessage } from '../messageBroker';
import { sendCoreMessage } from '../messageBroker';

export function generateDataLoaderBoards(models: IModels, subdomain: string) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result = await sendCardsMessage({
      subdomain,
      action: 'boards.find',
      data: {
        _id: { $in: ids }
      },
      isRPC: true,
      defaultValue: []
    });
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}
export function generateDataLoaderCategories(models: IModels) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result: any[] = await models.RiskAssessmentCategory.find({
      _id: { $in: ids }
    }).lean();
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}

export function generateDataLoaderField(models: IModels, subdomain: string) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result = await sendFormsMessage({
      subdomain,
      action: 'fields.find',
      data: {
        query: { _id: { $in: ids } }
      },
      isRPC: true,
      defaultValue: []
    });
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}

export function generateDataLoaderPipelines(
  models: IModels,
  subdomain: string
) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result = await sendCardsMessage({
      subdomain,
      action: 'pipelines.find',
      data: {
        _id: { $in: ids }
      },
      isRPC: true,
      defaultValue: []
    });
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}

export function generateDataLoaderRiskAssessments(models: IModels) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result: any[] = await models.RiskAssessments.find({
      _id: { $in: ids }
    }).lean();
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}

export function generateDataLoaderRiskIndicator(models: IModels) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result: any[] = await models.RiskIndicators.find({
      _id: { $in: ids }
    }).lean();
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}

export function generateDataLoaderStages(models: IModels, subdomain: string) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result = await sendCardsMessage({
      subdomain,
      action: 'stages.find',
      data: {
        _id: { $in: ids }
      },
      isRPC: true,
      defaultValue: []
    });
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}

export function generateDataLoaderUser(models: IModels, subdomain: string) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: { _id: { $in: ids } }
      },
      isRPC: true,
      defaultValue: []
    });
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}
