import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IHelpCenterConfigInput } from '@/helpcenter/@types/helpCenterConfig';
import { normalizeHelpCenterUrl } from '@/helpcenter/utils/helpCenterConfig';

type TClientPortal = {
  _id: string;
  domain?: string | null;
  token?: string | null;
};

export const withClientPortalFields = async (
  subdomain: string,
  config: IHelpCenterConfigInput,
): Promise<IHelpCenterConfigInput> => {
  const clientPortalId = config.clientPortalId?.trim() ?? '';

  if (!clientPortalId) {
    return config;
  }

  const clientPortal: TClientPortal | null = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'clientPortals',
    action: 'get',
    input: { _id: clientPortalId },
    defaultValue: null,
  });

  const url = normalizeHelpCenterUrl(clientPortal?.domain ?? '');

  if (!url) {
    return config;
  }

  return {
    ...config,
    clientPortalId,
    url,
    erxesAppToken: clientPortal?.token ?? '',
  };
};
