import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { ILotteryCampaign } from '../../../models/definitions/lotteryCampaigns';

const lotteriesMutations = {
  async lotteryCampaignsAdd(
    _root,
    doc: ILotteryCampaign,
    { models }: IContext
  ) {
    return models.LotteryCampaigns.createLotteryCampaign(doc);
  },

  async lotteryCampaignsEdit(
    _root,
    { _id, ...doc }: ILotteryCampaign & { _id: string },
    { models }: IContext
  ) {
    return models.LotteryCampaigns.updateLotteryCampaign(_id, doc);
  },

  async lotteryCampaignsRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) {
    return models.LotteryCampaigns.removeLotteryCampaigns(_ids);
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
