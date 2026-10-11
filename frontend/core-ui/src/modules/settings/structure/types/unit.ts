import { z } from 'zod';
import { UNIT_SCHEMA } from '../schemas/unitSchema';

export enum UnitHotKeyScope {
  UnitSettingsPage = 'unit-settings-page',
  UnitAddSheet = 'unit-add-sheet',
}

export type TUnitForm = z.infer<typeof UNIT_SCHEMA>;
