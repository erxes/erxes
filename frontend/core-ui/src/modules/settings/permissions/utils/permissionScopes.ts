import type { IPermissionModule } from '@/settings/permissions/types';

export const getDefaultScope = ({
  scopes,
}: Pick<IPermissionModule, 'scopes'>) => scopes?.[0]?.name ?? '';
