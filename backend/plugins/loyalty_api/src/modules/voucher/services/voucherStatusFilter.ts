import { FilterQuery } from 'mongoose';
import { IVoucher } from '@/voucher/@types/voucher';
import { VOUCHER_STATUS } from '@/voucher/constants';
import { IModels } from '~/connectionResolvers';

// Only these can still expire; a used or cancelled one stays what it is.
const OPEN_STATUSES = [VOUCHER_STATUS.NEW, VOUCHER_STATUS.ONHOLD];

/**
 * What makes an open voucher expired, as a query (see `voucherExpiresAt`):
 * past its campaign's last day of use, past its own end, or — without one —
 * past its campaign's end.
 */
const expiredConditions = async (
  models: IModels,
  now: Date,
): Promise<FilterQuery<IVoucher>[]> => {
  const ended = await models.VoucherCampaigns.find(
    { $or: [{ finishDateOfUse: { $lt: now } }, { endDate: { $lt: now } }] },
    { finishDateOfUse: 1, endDate: 1 },
  ).lean();

  const pastUse = ended
    .filter(({ finishDateOfUse }) => finishDateOfUse && finishDateOfUse < now)
    .map(({ _id }) => _id);
  const pastEnd = ended
    .filter(
      ({ finishDateOfUse, endDate }) =>
        !finishDateOfUse && endDate && endDate < now,
    )
    .map(({ _id }) => _id);

  return [
    { campaignId: { $in: pastUse } },
    { 'config.endDate': { $lt: now } },
    { 'config.endDate': null, campaignId: { $in: pastEnd } },
  ];
};

/**
 * A status as the screens show it: `expired` is read from the dates, and an
 * unused or held voucher that has expired is not listed as unused or held.
 */
export const voucherStatusSelector = async (
  models: IModels,
  status: string,
  now = new Date(),
): Promise<FilterQuery<IVoucher>> => {
  if (status === VOUCHER_STATUS.EXPIRED) {
    return {
      status: { $in: OPEN_STATUSES },
      $or: await expiredConditions(models, now),
    };
  }

  if (OPEN_STATUSES.includes(status)) {
    return { status, $nor: await expiredConditions(models, now) };
  }

  return { status };
};

/**
 * Open vouchers that end between now and `days` from now, by the same rule
 * as `voucherExpiresAt`: the campaign's last day of use, their own end, or —
 * without one — the campaign's end.
 */
export const voucherExpiresWithinSelector = async (
  models: IModels,
  days: number,
  now = new Date(),
): Promise<FilterQuery<IVoucher>> => {
  const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const within = { $gte: now, $lte: until };

  const [useEnds, campaignEnds] = await Promise.all([
    models.VoucherCampaigns.find(
      { finishDateOfUse: within },
      { _id: 1 },
    ).lean(),
    models.VoucherCampaigns.find(
      { finishDateOfUse: null, endDate: within },
      { _id: 1 },
    ).lean(),
  ]);

  return {
    status: { $in: OPEN_STATUSES },
    $and: [
      {
        $or: [
          { campaignId: { $in: useEnds.map(({ _id }) => _id) } },
          { 'config.endDate': within },
          {
            'config.endDate': null,
            campaignId: { $in: campaignEnds.map(({ _id }) => _id) },
          },
        ],
      },
      { $nor: await expiredConditions(models, now) },
    ],
  };
};
