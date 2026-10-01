import { z } from 'zod';
import { POSITION_SCHEMA } from '../schemas/positionSchema';

export enum PositionHotKeyScope {
  PositionSettingsPage = 'position-settings-page',
  PositionAddSheet = 'position-add-sheet',
}

export type TPositionForm = z.infer<typeof POSITION_SCHEMA>;
