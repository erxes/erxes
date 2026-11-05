import { isEmail } from '@/auth/utils';
import type { IDetail } from 'erxes-api-shared/core-types';
import type { PipelineStage } from 'mongoose';

export interface IProfilePatch {
  username?: string;
  email?: string;
  details?: {
    [Key in Exclude<keyof IDetail, 'fullName'>]?: IDetail[Key] | null;
  } & { employeeId?: string | null };
  links?: Record<string, string | null>;
  positionIds?: string[];
}

const DETAIL_FIELDS = new Set([
  'avatar',
  'coverPhoto',
  'shortName',
  'position',
  'birthDate',
  'workStartedDate',
  'location',
  'description',
  'operatorPhone',
  'firstName',
  'middleName',
  'lastName',
  'employeeId',
]);

export const buildProfilePatch = (patch: IProfilePatch): PipelineStage[] => {
  const fields: Record<string, unknown> = {};

  if (patch.username !== undefined) {
    if (
      typeof patch.username !== 'string' ||
      patch.username.trim().length < 3
    ) {
      throw new Error('Username must be at least 3 characters');
    }
    fields.username = { $literal: patch.username.trim() };
  }
  if (patch.email !== undefined) {
    if (typeof patch.email !== 'string' || !isEmail(patch.email.trim())) {
      throw new Error('Email must be a valid email');
    }
    fields.email = { $literal: patch.email.trim().toLowerCase() };
  }

  if (patch.details !== undefined) {
    if (!patch.details || Array.isArray(patch.details)) {
      throw new Error('Profile details must be an object');
    }
    for (const [key, value] of Object.entries(patch.details)) {
      if (!DETAIL_FIELDS.has(key))
        throw new Error(`Invalid profile field: ${key}`);
      const isDate = key === 'birthDate' || key === 'workStartedDate';
      if (
        value !== null &&
        (isDate
          ? !(value instanceof Date) || Number.isNaN(value.getTime())
          : typeof value !== 'string')
      ) {
        throw new Error(`Invalid value for profile field: ${key}`);
      }
    }
    if (Object.keys(patch.details).length > 0) {
      // Aggregation updates bypass the operatorPhone schema setter.
      const details = {
        ...patch.details,
        ...(typeof patch.details.operatorPhone === 'string' && {
          operatorPhone: patch.details.operatorPhone.replace(/\D/g, ''),
        }),
      };
      fields.details = {
        $mergeObjects: [
          { $ifNull: ['$details', {}] },
          { $literal: details },
        ],
      };
    }
  }

  if (patch.links !== undefined) {
    if (
      !patch.links ||
      Array.isArray(patch.links) ||
      typeof patch.links !== 'object'
    ) {
      throw new Error('Profile links must be an object');
    }
    for (const [key, value] of Object.entries(patch.links)) {
      if (
        !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(key) ||
        ['constructor', 'prototype', '__proto__'].includes(key) ||
        (value !== null && typeof value !== 'string')
      ) {
        throw new Error('Profile links contain an invalid key or value');
      }
    }
    if (Object.keys(patch.links).length > 0) {
      const links = Object.fromEntries(
        Object.entries(patch.links).map(([key, value]) => [key, value ?? '']),
      );
      fields.links = {
        $mergeObjects: [{ $ifNull: ['$links', {}] }, { $literal: links }],
      };
    }
  }

  if (patch.positionIds !== undefined) {
    if (
      !Array.isArray(patch.positionIds) ||
      patch.positionIds.some((id) => typeof id !== 'string' || !id)
    ) {
      throw new Error('Positions must be a list of position IDs');
    }
    fields.positionIds = { $literal: patch.positionIds };
  }

  if (Object.keys(fields).length === 0)
    throw new Error('No profile changes supplied');

  const pipeline: PipelineStage[] = [{ $set: fields }];
  if (
    patch.details &&
    ('firstName' in patch.details || 'lastName' in patch.details)
  ) {
    pipeline.push({
      $set: {
        'details.fullName': {
          $concat: [
            { $ifNull: ['$details.firstName', ''] },
            ' ',
            { $ifNull: ['$details.lastName', ''] },
          ],
        },
      },
    });
  }
  return pipeline;
};
