import { TAutomationManagePropertyConfig } from '@/automations/components/builder/nodes/actions/manageProperties/types/ManagePropertyTypes';
import { MetaFieldLine } from '@/automations/components/builder/nodes/components/MetaFieldLine';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

export const ManagePropertiesNodeContent = ({
  config,
}: NodeContentComponentProps<TAutomationManagePropertyConfig>) => {
  const { module, rules = [] } = config || {};
  const contentType = (module || '').split(':')[1];
  return (
    <>
      <div className="flex text-slate-600 text-xs ">
        <span className="font-mono">Content Type: </span>
        <span className="font-mono capitalize">{contentType}</span>
      </div>
      {rules
        .filter(({ field, value }) => field && value)
        .map(({ field, value }, index: number) => (
          <MetaFieldLine key={index} fieldName={field} content={value} />
        ))}
    </>
  );
};
