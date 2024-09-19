import React from "react";
import { IContract } from "../../types";
import { gql } from "@apollo/client";
import { queries } from "@erxes/ui-sales/src/deals/graphql";
import Items from "@erxes/ui-sales/src/boards/components/portable/Items";
import options from "@erxes/ui-sales/src/deals/options";
import { IDeal } from "@erxes/ui-sales/src/deals/types";
import { useQuery } from "@apollo/client";

interface Props {
  contract: IContract;
}

function DealSection(props: Props) {
  const onChange: any = () => {
    console.log("onChange");
  };

  const dealsData = useQuery(gql(queries.deals), {
    variables: { _ids: [props.contract.dealId] }
  });

  return (
    <Items
      items={dealsData?.data?.deals || ([] as IDeal[])}
      data={{ options: options }}
      onChangeItem={onChange}
      hideQuickButtons
    />
  );
}

export default DealSection;
