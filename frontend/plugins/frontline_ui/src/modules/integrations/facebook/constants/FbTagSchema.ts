import { EnumFacebookTag } from '../types/FacebookTypes';
import { z } from 'zod';

export const FACEBOOK_TAG_FORM_SCHEMA = z.object({
  tag: z.nativeEnum(EnumFacebookTag),
});
