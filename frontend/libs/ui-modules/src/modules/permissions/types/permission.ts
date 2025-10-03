import { QueryHookOptions } from '@apollo/client';
import { ICursorListResponse } from 'erxes-ui';
import { PERMISSION_FORM_SCHEMA } from 'ui-modules/modules/permissions/shemas/permission-create-form';
import { z } from 'zod';

export interface IPermission {
  _id: string;
  module: string;
  action: string;
  allowed: boolean;

  userId?: string;
  groupId?: string;

  group?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    email: string;
  };
}

export interface IPermissionAction {
  name: string;
  description?: string;
  module?: string;
}

export interface IPermissionModule {
  name: string;
  description?: string;
  actions?: IPermissionAction;
}

export interface IPermissionResponse extends ICursorListResponse<IPermission> {}

export interface IQueryPermissionsHookOptions
  extends QueryHookOptions<IPermissionResponse> {}

export enum PermissionsFilterScope {
  FilterBar = 'permissions-filter-bar',
}

export enum PermissionsScope {
  Page = 'permissions-settings',
  Create = 'permissions-create-modal',
}

export type IPermissionFormSchema = z.infer<typeof PERMISSION_FORM_SCHEMA>;
