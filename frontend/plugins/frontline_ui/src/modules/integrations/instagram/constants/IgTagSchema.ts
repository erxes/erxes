import { EnumInstagramTag } from '../types/InstagramTypes';
import { z } from 'zod';

export const INSTAGRAM_TAG_FORM_SCHEMA = z.object({
  tag: z.nativeEnum(EnumInstagramTag),
});
