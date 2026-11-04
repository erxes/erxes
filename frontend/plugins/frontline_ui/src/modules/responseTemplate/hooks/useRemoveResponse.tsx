import { useMutation } from '@apollo/client';
import { REMOVE_RESPONSE } from '../graphql/mutations/deleteResponse';
import { toast } from 'erxes-ui';
import { GET_RESPONSES } from '../graphql/queries/getResponses';
import { useTranslation } from 'react-i18next';
import { RESPONSE_TEMPLATE_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { useCloseRemovedSettingsRecord } from '@/settings/hooks/useCloseRemovedSettingsRecord';

export const useRemoveResponse = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.response-template',
  });
  const closeRemovedRecord = useCloseRemovedSettingsRecord(
    RESPONSE_TEMPLATE_CONTENT_TYPE,
  );
  const [removeResponse, { loading, error }] = useMutation(REMOVE_RESPONSE, {
    onCompleted: (data) => {
      closeRemovedRecord(data.responseTemplatesRemove?._id);
      toast({
        title: t(
          'response-removed-successfully',
          'Response removed successfully',
        ),
      });
    },
    refetchQueries: [{ query: GET_RESPONSES }],
  });
  return { removeResponse, loading, error };
};
