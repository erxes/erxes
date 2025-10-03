import { z } from 'zod';
import { POSITION_SCHEMA } from '../schemas/positionSchema';

export interface IPositionListItem {
  _id: string;
  code: string;
  title: string;
  parentId: string;
  userCount: number;
  order: string;
  hasChildren: boolean;
}

export enum PositionHotKeyScope {
  PositionSettingsPage = 'position-settings-page',
  PositionAddSheet = 'position-add-sheet',
}

export type TPositionForm = z.infer<typeof POSITION_SCHEMA>;
