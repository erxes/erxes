import { gql, useQuery, useMutation } from '@apollo/client';
import GeneralSettings from '@/msdynamic/components/settings/GeneralSettings';

const GET_CONFIGS = gql(`
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`);

const SAVE_CONFIGS = gql(`
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`);

const MsdynamicSettingsPage = () => {
  const { data, loading, refetch } = useQuery(GET_CONFIGS, {
    variables: { code: 'DYNAMIC' },
    fetchPolicy: 'network-only',
  });

  const [saveMutation] = useMutation(SAVE_CONFIGS);

  const configsMap = {
    DYNAMIC: data?.configsGetValue?.value || {},
  };

  const handleSave = async (configs: any) => {
    try {
      const existing = data?.configsGetValue?.value || {};
      const dynamic = configs?.DYNAMIC || {};

      const cleaned: any = {};

      for (const key of Object.keys(dynamic)) {
        const config = dynamic[key];

        if (!config?.brandId || config.brandId.trim() === '') {
          console.warn('Skipping invalid config:', config);
          continue;
        }

        cleaned[config.brandId] = config;
      }

      const finalPayload = {
        DYNAMIC: {
          ...existing,
          ...cleaned,
        },
      };

      console.log('FINAL PAYLOAD:', finalPayload);

      await saveMutation({
        variables: {
          configsMap: finalPayload, 
        },
      });

      await refetch();
    } catch (e: any) {
      console.error('❌ Save failed:', e.message, e);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 h-full overflow-auto">
      <GeneralSettings
        configsMap={configsMap}
        save={handleSave}
      />
    </div>
  );
};

export default MsdynamicSettingsPage;