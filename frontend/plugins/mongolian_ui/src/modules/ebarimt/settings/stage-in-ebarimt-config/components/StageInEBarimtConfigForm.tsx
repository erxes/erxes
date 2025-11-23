import { useCreateStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useCreateStageInEbarimtConfig';
import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { GET_CONFIGS_GET_VALUE } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/getConfigsGetValue';
import { TStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/types';
import { NewConfigForm } from '@/ebarimt/settings/stage-in-ebarimt-config/components/NewConfigForm';
import { EditConfigForm } from '@/ebarimt/settings/stage-in-ebarimt-config/components/EditConfigForm';

export const StageInEbarimtConfigForm = () => {
  const [showNewConfig, setShowNewConfig] = useState(false);
  const { createStageInEbarimtConfig, loading: createLoading } =
    useCreateStageInEbarimtConfig();
  const { data, refetch, loading } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: 'stageInEbarimt' },
    fetchPolicy: 'network-only',
  });

  const configValue = data?.configsGetValue?.value;
  const parsedConfig = configValue
    ? typeof configValue === 'string'
      ? JSON.parse(configValue)
      : configValue
    : null;

  const handleSubmit = async (formData: TStageInEbarimtConfig) => {
    try {
      const configsMapString = {
        stageInEbarimt: {
          title: formData.title,
          destinationStageBoard: formData.destinationStageBoard,
          pipelineId: formData.pipelineId,
          stageId: formData.stageId,
          posNo: formData.posNo,
          companyRD: formData.companyRD,
          merchantTin: formData.merchantTin,
          branchOfProvice: formData.branchOfProvice,
          subProvice: formData.subProvice,
          districtCode: formData.districtCode,
          companyName: formData.companyName,
          defaultUnitedCode: formData.defaultUnitedCode,
          headerText: formData.headerText,
          branchNo: formData.branchNo,
          citytaxPercent: formData.citytaxPercent,
          HasVat: formData.HasVat,
          HasAllCitytax: formData.HasAllCitytax,
          vatPercent: formData.vatPercent,
          anotherRulesOfProductsOnVat: formData.anotherRulesOfProductsOnVat,
          vatPayableAccount: formData.vatPayableAccount,
          allCitytaxPayableAccount: formData.allCitytaxPayableAccount,
          footerText: formData.footerText,
          anotherRulesOfProductsOnCitytax:
            formData.anotherRulesOfProductsOnCitytax,
          withDescription: formData.withDescription,
          skipEbarimt: formData.skipEbarimt,
        },
      };

      await createStageInEbarimtConfig({
        variables: {
          configsMap: configsMapString,
        },
      });

      await refetch();
      setShowNewConfig(false);
    } catch (error) {
      console.error('Error creating config:', error);
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full w-full mx-auto max-w-6xl flex flex-col overflow-y-auto">
      {!parsedConfig || showNewConfig ? (
        <NewConfigForm
          onCancel={() => {
            if (parsedConfig) {
              setShowNewConfig(false);
            }
          }}
          onSubmit={handleSubmit}
          loading={createLoading}
        />
      ) : (
        <EditConfigForm
          config={parsedConfig}
          onNewConfig={() => setShowNewConfig(true)}
          onSubmit={handleSubmit}
          loading={createLoading}
        />
      )}
    </div>
  );
};
