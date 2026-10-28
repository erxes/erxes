import { TFunction } from 'i18next';
import { z } from 'zod';
import { STRUCTURE_SEAT_COVERAGES } from '../utils/structureSeatCoverage';

export const NEW_STRUCTURE_SEAT = 'new';

const coverageEnum = z.enum([
  STRUCTURE_SEAT_COVERAGES[0],
  ...STRUCTURE_SEAT_COVERAGES.slice(1),
]);

export const getStructureSeatTargetSchema = (t: TFunction) =>
  z
    .object({
      entityId: z.string().min(1, t('node-required')),
      seatId: z.string().min(1, t('seat-required')),
      positionId: z.string(),
      coverage: coverageEnum,
      coveredEntityIds: z.array(z.string()),
    })
    .superRefine(({ seatId, positionId, coverage, coveredEntityIds }, ctx) => {
      if (seatId !== NEW_STRUCTURE_SEAT) {
        return;
      }

      if (!positionId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['positionId'],
          message: t('position-required'),
        });
      }

      if (coverage === 'selected' && !coveredEntityIds.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['coveredEntityIds'],
          message: t('covered-nodes-required'),
        });
      }
    });

export type TStructureSeatTargetForm = z.infer<
  ReturnType<typeof getStructureSeatTargetSchema>
>;

export const EMPTY_STRUCTURE_SEAT_TARGET: TStructureSeatTargetForm = {
  entityId: '',
  seatId: '',
  positionId: '',
  coverage: 'node',
  coveredEntityIds: [],
};
