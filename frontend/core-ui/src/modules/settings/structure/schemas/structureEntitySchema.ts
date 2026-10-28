import { TFunction } from 'i18next';
import { z } from 'zod';
import {
  IStructureContactForm,
  IStructureEntityTypeForm,
  IStructureLocationForm,
} from '../types/structureEntity';
import { STRUCTURE_SEAT_COVERAGES } from '@/structure-access';
import { STRUCTURE_LEGACY_KINDS } from '../constants/structureCapabilities';

const coordinateValue = (limit: number, message: string) =>
  z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        (Number.isFinite(Number(value)) && Math.abs(Number(value)) <= limit),
      { message },
    );

export const getStructureLocationSchema = (
  t: TFunction,
): z.ZodType<IStructureLocationForm> =>
  z.object({
    location: z.object({
      address: z.string(),
      coordinate: z
        .object({
          latitude: coordinateValue(90, t('latitude-invalid')),
          longitude: coordinateValue(180, t('longitude-invalid')),
        })
        .nullable(),
      radius: z.number().min(0),
    }),
  });

export const getStructureContactSchema = (
  t: TFunction,
): z.ZodType<IStructureContactForm> => {
  const link = z.string().trim().url(t('link-invalid')).or(z.literal(''));

  return z.object({
    contact: z.object({
      phoneNumber: z.string(),
      email: z.string().trim().email(t('email-invalid')).or(z.literal('')),
      links: z.object({
        website: link,
        facebook: link,
        whatsapp: link,
        twitter: link,
        youtube: link,
      }),
      image: z
        .object({
          url: z.string(),
          name: z.string(),
          type: z.string().optional(),
          size: z.number().optional(),
        })
        .nullable(),
    }),
  });
};

export const getStructureTypeNameSchema = (t: TFunction) =>
  z.object({
    name: z.string().trim().min(1, t('name-required')),
  });

export type TStructureTypeNameForm = z.infer<
  ReturnType<typeof getStructureTypeNameSchema>
>;

export const getStructureEntityTypeSchema = (
  t: TFunction,
): z.ZodType<IStructureEntityTypeForm> =>
  z.object({
    name: z.string().trim().min(1, t('name-required')),
    icon: z.string(),
    parentTypeIds: z.array(z.string()),
    legacyKind: z.enum(STRUCTURE_LEGACY_KINDS),
    capabilities: z.array(z.string()),
  });

export const getStructureMemberSchema = (t: TFunction) =>
  z
    .object({
      userId: z.string().min(1, t('member-required')),
      isPrimary: z.boolean(),
      startsAt: z.date().optional(),
      endsAt: z.date().optional(),
    })
    .refine(
      ({ startsAt, endsAt }) => !startsAt || !endsAt || endsAt > startsAt,
      { path: ['endsAt'], message: t('end-after-start') },
    );

export type TStructureMemberForm = z.infer<
  ReturnType<typeof getStructureMemberSchema>
>;

const coverageEnum = z.enum([
  STRUCTURE_SEAT_COVERAGES[0],
  ...STRUCTURE_SEAT_COVERAGES.slice(1),
]);

export const getStructureSeatSchema = (t: TFunction) =>
  z
    .object({
      positionId: z.string().min(1, t('position-required')),
      coverage: coverageEnum,
      coveredEntityIds: z.array(z.string()),
    })
    .refine(
      ({ coverage, coveredEntityIds }) =>
        coverage !== 'selected' || coveredEntityIds.length > 0,
      { path: ['coveredEntityIds'], message: t('covered-nodes-required') },
    );

export type TStructureSeatForm = z.infer<
  ReturnType<typeof getStructureSeatSchema>
>;

export const getStructureSeatHoldersSchema = (t: TFunction) =>
  z.object({
    userIds: z.array(z.string()).min(1, t('holders-required')),
  });

export type TStructureSeatHoldersForm = z.infer<
  ReturnType<typeof getStructureSeatHoldersSchema>
>;

export const getStructurePositionSchema = (t: TFunction) =>
  z.object({
    name: z.string().trim().min(1, t('name-required')),
    description: z.string(),
    groupIds: z.array(z.string()),
  });

export type TStructurePositionForm = z.infer<
  ReturnType<typeof getStructurePositionSchema>
>;
