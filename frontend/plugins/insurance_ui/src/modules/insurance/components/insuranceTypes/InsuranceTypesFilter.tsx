import { GenericFilter } from '../shared';

export const InsuranceTypesFilter = () => {
  return (
    <GenericFilter
      id="insurance-types-filter"
      sessionKey="insurance-types-cursor"
    />
  );
};
