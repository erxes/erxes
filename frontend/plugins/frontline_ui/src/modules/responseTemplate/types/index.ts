import { z } from 'zod';
import {
  CREATE_RESPONSE_FORM_SCHEMA,
  UPDATE_RESPONSE_FORM_SCHEMA,
} from '@/settings/schema/response';
import type { ResponseTemplatesQuery } from '~/gql/graphql';

export type IResponseTemplate = NonNullable<
  NonNullable<
    NonNullable<ResponseTemplatesQuery['responseTemplates']>['list']
  >[number]
>;

export type TCreateResponseForm = z.infer<typeof CREATE_RESPONSE_FORM_SCHEMA>;
export type TUpdateResponseForm = z.infer<typeof UPDATE_RESPONSE_FORM_SCHEMA>;
export type TResponseForm = TCreateResponseForm | TUpdateResponseForm;
