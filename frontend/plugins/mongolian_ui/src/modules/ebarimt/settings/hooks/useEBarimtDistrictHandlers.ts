import { useCallback } from 'react';
import { getDistrictSelectionFromCode } from '@/ebarimt/settings/constants/distrcitData';

interface UseEBarimtDistrictHandlersOptions {
  deriveDistrictCode?: boolean;
  getBranchCode: () => string | undefined;
  setBranchCode: (value: string) => void;
  setDistrictCode: (value: string) => void;
  setSubBranchCode: (value: string) => void;
}

export const useEBarimtDistrictHandlers = ({
  deriveDistrictCode = false,
  getBranchCode,
  setBranchCode,
  setDistrictCode,
  setSubBranchCode,
}: UseEBarimtDistrictHandlersOptions) => {
  const handleBranchChange = useCallback(
    (value: string) => {
      setBranchCode(value);
      setSubBranchCode('');
      setDistrictCode(value);
    },
    [setBranchCode, setDistrictCode, setSubBranchCode],
  );

  const handleSubBranchChange = useCallback(
    (value: string) => {
      setSubBranchCode(value);

      if (deriveDistrictCode) {
        const branchCode = getBranchCode();
        setDistrictCode(branchCode ? `${branchCode}${value}` : '');
      }
    },
    [deriveDistrictCode, getBranchCode, setDistrictCode, setSubBranchCode],
  );

  const handleDistrictCodeChange = useCallback(
    (districtCode: string) => {
      const { branchCode, subBranchCode } =
        getDistrictSelectionFromCode(districtCode);

      setBranchCode(branchCode);
      setSubBranchCode(subBranchCode);
    },
    [setBranchCode, setSubBranchCode],
  );

  return {
    handleBranchChange,
    handleDistrictCodeChange,
    handleSubBranchChange,
  };
};
