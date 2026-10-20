import { TFilesRole } from '../types';

const RANK: Record<TFilesRole, number> = {
  viewer: 1,
  contributor: 2,
  manager: 3,
};

// UI hint only; the server enforces roles.
export const filesCanContribute = (role?: TFilesRole | null) =>
  !!role && RANK[role] >= RANK.contributor;

export const filesCanManage = (role?: TFilesRole | null) => role === 'manager';
