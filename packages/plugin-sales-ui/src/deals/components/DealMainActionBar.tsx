import { IBoard } from "@erxes/ui-sales/src/boards/types";
import MainActionBar from "@erxes/ui-sales/src/boards/components/MainActionBar";
import React from "react";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import SelectCustomers from "@erxes/ui-contacts/src/customers/containers/SelectCustomers";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import { __ } from "coreui/utils";
import { getBoardViewType } from "@erxes/ui-sales/src/boards/utils";
import { isEnabled } from "@erxes/ui/src/utils/core";
import options from "@erxes/ui-sales/src/deals/options";

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

const DealMainActionBar = (props: Props) => {
  const { queryParams, onSelect } = props;

  const viewType = getBoardViewType();

  const extraFilter = (
    <>
      <SelectProducts
        label={__("Filter by products")}
        name="productIds"
        queryParams={queryParams}
        onSelect={onSelect}
      />

      <SelectCompanies
        label={__("Filter by companies")}
        name="companyIds"
        queryParams={queryParams}
        onSelect={onSelect}
      />
      <SelectCustomers
        label={__("Filter by customers")}
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
    type: "m",
    link: `/deal/${viewType}`
  };

  return <MainActionBar viewType={viewType} {...extendedProps} />;
};

export default DealMainActionBar;
