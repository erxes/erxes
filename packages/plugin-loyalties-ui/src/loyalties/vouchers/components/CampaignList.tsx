import { Box, DataWithLoader, DropdownToggle, Icon, Tip } from "@erxes/ui/src";
import { __, router } from "@erxes/ui/src/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { colors, SidebarList } from "@erxes/ui/src";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import queryString from "query-string";
import React from "react";
import { IVoucherCampaign } from "../../../configs/voucherCampaign/types";
import { ExtraButtons } from "../../../styles";

interface IProps {
  queryParams: any;
  refetch: any;
  voucherCampaigns: IVoucherCampaign[];
  voucherCampaignsCount: number;
  loading: boolean;
}

const List = (props: IProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { queryParams, voucherCampaigns, loading } = props;

  const clearCategoryFilter = () => {
    router.removeParams(navigate, location, "campaignId");
  };

  const isActive = (id: string) => {
    const currentGroup = queryParams?.campaignId || "";

    return currentGroup === id;
  };

  const renderContent = () => {
    const otherParams = { ...queryParams };
    delete otherParams.campaignId;
    const qryString = queryString.stringify(otherParams);

    const result: React.ReactNode[] = [];

    for (const campaign of voucherCampaigns || []) {
      const name = `${campaign.title} `;

      const VOUCHER_TYPES = {
        spin: `/spins?${qryString}&voucherCampaignId=${campaign._id}`,
        lottery: `/lotteries?${qryString}&voucherCampaignId=${campaign._id}`,
        default: `?${qryString}&campaignId=${campaign._id}`,
      };

      result.push(
        <li key={campaign._id}>
          <Link
            to={VOUCHER_TYPES[campaign.voucherType] || VOUCHER_TYPES.default}
            className={isActive(campaign?._id || "") ? "active" : ""}
            style={{ color: colors.linkPrimary, fontWeight: 500 }}
          >
            {name}
          </Link>
        </li>
      );
    }

    return <SidebarList>{result}</SidebarList>;
  };

  const extraButtons = (
    <ExtraButtons>
      {queryParams["campaignId"] && (
        <Tip text={"Clear Filter"}>
          <Icon icon="times-circle" onClick={() => clearCategoryFilter()} />
        </Tip>
      )}
      <Dropdown as={DropdownToggle} toggleComponent={<Icon icon="cog" />}>
        <Link
          to={`/erxes-plugin-loyalty/settings/voucher`}
          style={{ color: colors.linkPrimary, fontWeight: 500 }}
        >
          {__("Manage Voucher Campaigns")}
        </Link>
      </Dropdown>
    </ExtraButtons>
  );

  return (
    <Box title="Filter by Voucher Campaign" extraButtons={extraButtons} isOpen>
      <DataWithLoader
        data={renderContent()}
        loading={loading}
        emptyText="There is no Voucher Campaigns"
        emptyIcon="folder-2"
        size="small"
      />
    </Box>
  );
};

export default List;
