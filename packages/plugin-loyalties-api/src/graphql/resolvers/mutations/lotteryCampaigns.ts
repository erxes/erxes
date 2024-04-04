import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { ILotteryCampaign } from '../../../models/definitions/lotteryCampaigns';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES
} from '../../../logUtils';

const lotteriesMutations = {
  async lotteryCampaignsAdd(
    _root,
    doc: ILotteryCampaign,
    { models, subdomain, user }: IContext
  ) {
    const create = await models.LotteryCampaigns.createLotteryCampaign(doc);
    await putCreateLog(
      models,
      subdomain,
      { type: MODULE_NAMES.LOTTERY, newData: create, object: create },
      user
    );
    return create;
  },

  async lotteryCampaignsEdit(
    _root,
    { _id, ...doc }: ILotteryCampaign & { _id: string },
    { models, subdomain, user }: IContext
  ) {
    const lotteryCampaign = await models.LotteryCampaigns.findOne({ _id });
    const update = await models.LotteryCampaigns.updateLotteryCampaign(
      _id,
      doc
    );

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.LOTTERY,
        object: lotteryCampaign,
        newData: doc,
        updatedDocument: update
      },
      user
    );
    return update;
  },

  async lotteryCampaignsRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models, subdomain, user }: IContext
  ) {
    const lotteryCampaign: ILotteryCampaign[] = await models.LotteryCampaigns.find(
      {
        _id: { $in: _ids }
      }
    ).lean();

    const removed = models.LotteryCampaigns.removeLotteryCampaigns(_ids);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.LOTTERY, object: lotteryCampaign },
      user
    );
    return removed;
  },

  async doLottery(
    _root,
    params: { campaignId: string; awardId: string },
    { models }: IContext
  ) {
    return models.LotteryCampaigns.doLottery(params);
  },
  async doLotteryMultiple(
    _root,
    params: { campaignId: string; awardId: string; multiple: number },
    { models }: IContext
  ) {
    return models.LotteryCampaigns.multipleDoLottery(params);
  },
  async getNextChar(
    _root,
    params: { campaignId: string; awardId: string; prevChars: string },
    { models }: IContext
  ) {
    return models.LotteryCampaigns.getNextChar(params);
  }
};

checkPermission(lotteriesMutations, 'lotteryCampaignsAdd', 'manageLoyalties');
checkPermission(lotteriesMutations, 'lotteryCampaignsEdit', 'manageLoyalties');
checkPermission(
  lotteriesMutations,
  'lotteryCampaignsRemove',
  'manageLoyalties'
);

export default lotteriesMutations;
