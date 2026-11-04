import { nanoid } from 'nanoid';
import type { IModels } from '~/connectionResolvers';
import type { ICover, ICoverDetail } from '../@types/cover';

interface TerminalResultInput {
  _id: string;
  resultId: string;
  bank: string;
  response?: string | null;
}

const editableFilter = (_id: string, posToken: string) => ({
  _id,
  posToken,
  status: { $nin: ['confirm', 'confirming'] },
});

const mapPaidType = (bank: string, fields: Record<string, unknown>) => ({
  $map: {
    input: '$details',
    as: 'detail',
    in: {
      $cond: [
        { $eq: ['$$detail.paidType', { $literal: bank }] },
        { $mergeObjects: ['$$detail', fields] },
        '$$detail',
      ],
    },
  },
});

// Payment edits replace their amounts, while terminal history remains server-owned.
export const coverDetailsUpdate = (details: ICoverDetail[]) => {
  if (
    !Array.isArray(details) ||
    details.some(
      (detail) =>
        !detail ||
        typeof detail.paidType !== 'string' ||
        !detail.paidType.trim(),
    )
  ) {
    throw new Error('Cover details require a paidType');
  }
  if (
    new Set(details.map((detail) => detail.paidType)).size !== details.length
  ) {
    throw new Error('Cover paidType must be unique');
  }
  const rows = details.map((detail) => {
    if (detail.paidSummary !== undefined && !Array.isArray(detail.paidSummary))
      throw new Error('Invalid payment summary');
    return {
      _id: detail._id || nanoid(),
      paidType: detail.paidType,
      ...(detail.paidSummary !== undefined
        ? { paidSummary: detail.paidSummary }
        : {}),
      ...(detail.paidDetail !== undefined
        ? { paidDetail: detail.paidDetail }
        : {}),
    };
  });
  return {
    $concatArrays: [
      {
        $map: {
          input: { $literal: rows },
          as: 'incoming',
          in: {
            $let: {
              vars: {
                saved: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: { $ifNull: ['$details', []] },
                            as: 'saved',
                            cond: {
                              $eq: ['$$saved.paidType', '$$incoming.paidType'],
                            },
                          },
                        },
                        0,
                      ],
                    },
                    {},
                  ],
                },
              },
              in: {
                $mergeObjects: [
                  '$$saved',
                  '$$incoming',
                  {
                    _id: { $ifNull: ['$$saved._id', '$$incoming._id'] },
                    paidSummary: {
                      $ifNull: [
                        '$$incoming.paidSummary',
                        { $ifNull: ['$$saved.paidSummary', []] },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $filter: {
          input: { $ifNull: ['$details', []] },
          as: 'saved',
          cond: {
            $and: [
              {
                $not: [
                  {
                    $in: [
                      '$$saved.paidType',
                      { $literal: rows.map((row) => row.paidType) },
                    ],
                  },
                ],
              },
              {
                $gt: [
                  { $size: { $ifNull: ['$$saved.terminalResults', []] } },
                  0,
                ],
              },
            ],
          },
        },
      },
    ],
  };
};

export const saveCoverTerminalResult = async (
  models: IModels,
  cover: ICover,
  { _id, resultId, bank, response }: TerminalResultInput,
  userId: string,
): Promise<ICover> => {
  const owner = cover.details?.find((detail) =>
    detail.terminalResults?.some((entry) => entry._id === resultId),
  );
  const existing = owner?.terminalResults?.find(
    (entry) => entry._id === resultId,
  );
  if (owner && owner.paidType !== bank)
    throw new Error('Terminal result bank does not match');
  if (existing?.response !== undefined) {
    if (response && response !== existing.response)
      throw new Error('Terminal result cannot be replaced');
    return cover;
  }
  const timestamp = new Date();
  if (!response) {
    if (existing) return cover;
    const entry = { _id: resultId, bank, createdAt: timestamp };
    const updated = await models.Covers.findOneAndUpdate(
      {
        ...editableFilter(_id, cover.posToken),
        'details.terminalResults._id': { $ne: resultId },
      },
      [
        {
          $set: {
            details: {
              $cond: [
                {
                  $in: [
                    { $literal: bank },
                    { $ifNull: ['$details.paidType', []] },
                  ],
                },
                { $ifNull: ['$details', []] },
                {
                  $concatArrays: [
                    { $ifNull: ['$details', []] },
                    {
                      $literal: [
                        { _id: resultId, paidType: bank, paidSummary: [] },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $set: {
            details: mapPaidType(bank, {
              terminalResults: {
                $concatArrays: [
                  { $ifNull: ['$$detail.terminalResults', []] },
                  { $literal: [entry] },
                ],
              },
            }),
            modifiedAt: timestamp,
            modifiedBy: { $literal: userId },
          },
        },
      ],
      { new: true },
    ).lean();
    if (updated) return updated;
  } else {
    if (!existing)
      throw new Error('Reserve a terminal fetch before saving its result');
    const updated = await models.Covers.findOneAndUpdate(
      {
        ...editableFilter(_id, cover.posToken),
        details: {
          $elemMatch: {
            paidType: bank,
            terminalResults: {
              $elemMatch: { _id: resultId, response: { $exists: false } },
            },
          },
        },
      },
      [
        {
          $set: {
            details: mapPaidType(bank, {
              terminalResults: {
                $map: {
                  input: '$$detail.terminalResults',
                  as: 'entry',
                  in: {
                    $cond: [
                      { $eq: ['$$entry._id', { $literal: resultId }] },
                      {
                        $mergeObjects: ['$$entry', { $literal: { response } }],
                      },
                      '$$entry',
                    ],
                  },
                },
              },
            }),
            modifiedAt: timestamp,
            modifiedBy: { $literal: userId },
          },
        },
      ],
      { new: true },
    ).lean();
    if (updated) return updated;
  }
  const current = await models.Covers.getCover(_id);
  const saved = current.details
    ?.find((detail) => detail.paidType === bank)
    ?.terminalResults?.find((entry) => entry._id === resultId);
  if (saved && (!response || saved.response === response)) return current;
  throw new Error('Cover changed; terminal result was not saved');
};
