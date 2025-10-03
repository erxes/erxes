import {
  CompaniesMergeSheet,
  CompaniesMergeSheetTrigger,
} from '@/contacts/companies/components/companies-command-bar/CompaniesMergeSheet';
import { Row } from '@tanstack/table-core';
import { TCompany } from '@/contacts/types/companyType';

interface CompaniesMergeProps {
  companies: TCompany[];
  rows: Row<TCompany>[];
}

export const CompaniesMerge = ({ companies, rows }: CompaniesMergeProps) => {
  const disabled = companies.length !== 2;
  if (disabled) return <CompaniesMergeSheetTrigger disabled={disabled} />;
  return CompaniesMergeLogic({ companies, rows });
};

const CompaniesMergeLogic = ({ companies }: CompaniesMergeProps) => {
  const merge = (objValue: unknown, srcValue: unknown, key: string) => {
    if (objValue === null) return srcValue;
    else if (srcValue === null) return objValue;
    else if (Array.isArray(objValue) && Array.isArray(srcValue))
      return objValue.concat(srcValue);
    else if (typeof objValue === 'object' && typeof srcValue === 'object')
      return { ...objValue, ...srcValue };
    else if (objValue !== srcValue) {
      const type = key === 'avatar' ? 'avatar' : 'string';
      return { conflicted: true, objValue, srcValue, type };
    }
    return undefined;
  };

  return (
    <CompaniesMergeSheet className="p-6 flex gap-2 h-full">
      <div className="flex-[2] h-full flex flex-col gap-2">
        <div className="flex justify-between gap-2 mb-1 ">
          <span className="text-sm font-semibold text-muted-foreground w-full">
            {companies[0]?.primaryName}
          </span>
          <span className="text-sm font-semibold text-muted-foreground w-full">
            {companies[1]?.primaryName}
          </span>
        </div>
      </div>
      <div className="flex-[1.2] h-full ml-5 flex flex-col gap-2"></div>
    </CompaniesMergeSheet>
  );
};
