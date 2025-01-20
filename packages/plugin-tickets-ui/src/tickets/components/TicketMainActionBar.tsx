import { IBoard } from "@erxes/ui-tickets/src/boards/types";
import { INTEGRATION_KINDS } from "@erxes/ui/src/constants/integrations";
import { IOption } from "@erxes/ui/src/types";
import MainActionBar from "@erxes/ui-tickets/src/boards/components/MainActionBar";
import React from "react";
import Select, { OnChangeValue } from "react-select";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import SelectCustomers from "@erxes/ui-contacts/src/customers/containers/SelectCustomers";
import { __ } from "coreui/utils";
import { getBoardViewType } from "@erxes/ui-tickets/src/boards/utils";
import { isEnabled } from "@erxes/ui/src/utils/core";
import options from "@erxes/ui-tickets/src/tickets/options";

type Props = {
  onSearch: (search: string) => void;
  onSelect: (values: string[] | string, name: string) => void;
  onDateFilterSelect: (name: string, value: string) => void;
  onClear: (name: string, values) => void;
  isFiltered: () => boolean;
  clearFilter: () => void;
  boards: IBoard[];
  middleContent?: () => React.ReactNode;
  history: any;
  queryParams: any;
};

const TicketMainActionBar = (props: Props) => {
  const { queryParams, onSelect } = props;

  const viewType = getBoardViewType();

  const sourceValues = INTEGRATION_KINDS.ALL.map(kind => ({
    label: kind.text,
    value: kind.value
  }));

  sourceValues.push({
    label: "Other",
    value: "other"
  });

  const sources = queryParams ? queryParams.source : [];

  const onSourceSelect = (ops: OnChangeValue<IOption, true>) =>
    onSelect(
      ops.map(option => option.value),
      "source"
    );

  const extraFilter = (
    <>
      <Select
        placeholder={__("Choose a source")}
        value={sourceValues.filter(s => (sources || "").includes(s.value))}
        options={sourceValues}
        name="source"
        onChange={onSourceSelect}
        isMulti={true}
      />

      <SelectCompanies
        label={__("Choose companies")}
        name="companyIds"
        queryParams={queryParams}
        onSelect={onSelect}
      />

      <SelectCustomers
        label={__("Choose customers")}
        name="customerIds"
        queryParams={queryParams}
        onSelect={onSelect}
      />
    </>
  );

  const extendedProps = {
    ...props,
    options,
    extraFilter,
    link: `/ticket/${viewType}`
  };

  return <MainActionBar viewType={viewType} {...extendedProps} />;
};

export default TicketMainActionBar;
