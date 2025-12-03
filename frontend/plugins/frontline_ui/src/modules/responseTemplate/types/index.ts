import { IUser } from 'ui-modules';
import { z } from 'zod';
import {
  CREATE_RESPONSE_FORM_SCHEMA,
  UPDATE_RESPONSE_FORM_SCHEMA,
} from '@/settings/schema/response';
import { useForm } from 'react-hook-form';
export interface IResponseTemplate {
  _id: string;
  createdAt: string;
  content: string;
  channelId: string;
  name: string;
  updatedAt: string;
  userId: string;
  createdUser: IUser;
}

export interface IResponseTemplateFilter {
  filter: {
    _id?: string;
    name?: string;
    content?: string;
    cursorMode?: 'inclusive' | 'exclusive';
    direction?: 'forward' | 'backward';
    limit?: number;
    channelId?: string;
    createdAt?: string;
    updatedAt?: string;
    files?: string[];
    orderBy?: any;
  };
}

export type TCreateResponseForm = z.infer<typeof CREATE_RESPONSE_FORM_SCHEMA>;
export type TUpdateResponseForm = z.infer<typeof UPDATE_RESPONSE_FORM_SCHEMA>;
export type TResponseForm = TCreateResponseForm | TUpdateResponseForm;
