import { useCallback } from 'react';

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
      setDistrictCode('');
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

  return { handleBranchChange, handleSubBranchChange };
};
