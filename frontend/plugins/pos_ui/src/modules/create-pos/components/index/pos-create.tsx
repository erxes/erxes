import { useAtom } from 'jotai';
import { posCategoryAtom } from '../../states/posCategory';
import { PosCreateLayout, PosCreateTabContent } from './pos-create-layout';
import { usePosCreateForm } from '../../hooks/usePosCreateForm';
import { usePosCreateHandlers } from '../../hooks/useCustomHook';
import { getPosCreateTabs } from '../../utils';

export const PosCreate = () => {
  const [posCategory] = useAtom(posCategoryAtom);
  const { forms, formStepData } = usePosCreateForm();
  const {
    handleBasicInfoSubmit,
    handleFinalSubmit,
    handleNodesUpdate,
    handleSaveSlots,
    loading,
    error,
    createdPosId,
    slotNodes,
  } = usePosCreateHandlers({ forms, formStepData });

  const tabs = getPosCreateTabs({
    posCategory,
    forms,
    handlers: {
      handleNodesUpdate,
    },
    data: {
      createdPosId,
      slotNodes,
    },
  });

  return (
    <PosCreateLayout
      form={forms.basicInfo}
      onFormSubmit={handleBasicInfoSubmit}
      onFinalSubmit={handleFinalSubmit}
      onSaveSlots={
        createdPosId ? () => handleSaveSlots(createdPosId) : undefined
      }
      loading={loading}
      error={error}
    >
      {tabs.map(({ value, component }) => (
        <PosCreateTabContent key={value} value={value}>
          {component}
        </PosCreateTabContent>
      ))}
    </PosCreateLayout>
  );
};
