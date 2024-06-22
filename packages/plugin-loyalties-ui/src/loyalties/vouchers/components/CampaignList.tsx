import { DataWithLoader, Icon, Tip } from "@erxes/ui/src/components";
import { Sidebar, Wrapper } from "@erxes/ui/src/layout";
import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import { IVoucherCampaign } from "../../../configs/voucherCampaign/types";
import { Link } from "react-router-dom";
import React from "react";
import { SidebarListItem } from "../../common/styles";
import queryString from "query-string";

const { Section } = Wrapper.Sidebar;

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

  const clearCategoryFilter = () => {
    router.setParams(navigate, location, { campaignId: null });
  };

  const isActive = (id: string) => {
    const { queryParams } = props;
    const currentGroup = queryParams?.campaignId || "";

    return currentGroup === id;
  };

  const renderContent = () => {
    const { voucherCampaigns, queryParams } = props;

    const otherParams = { ...queryParams };
    delete otherParams.campaignId;
    const qryString = queryString.stringify(otherParams);

    const result: React.ReactNode[] = [];

    for (const campaign of voucherCampaigns || []) {
      const name = `${campaign.title} (${campaign.vouchersCount})`;

      let link;
      switch (campaign.voucherType) {
        case "lottery":
          link = `/lotteries?${qryString}&voucherCampaignId=${campaign._id}`;
          break;

        case "spin":
          link = `/spins?${qryString}&voucherCampaignId=${campaign._id}`;
          break;

        default:
          link = `?${qryString}&campaignId=${campaign._id}`;
      }

      result.push(
        <SidebarListItem
          key={campaign._id}
          $isActive={isActive(campaign?._id || "")}
        >
          <Link to={link}>{name}</Link>
        </SidebarListItem>
      );
    }

    return result;
  };

  const renderCategoryHeader = () => {
    return (
      <>
        <Section.Title>
          <Link to={`/erxes-plugin-loyalty/settings/voucher`}>
            <Icon icon="cog" />
            {__("Manage Voucher Campaigns")}
          </Link>
          <Section.QuickButtons>
            {router.getParam(location, "campaignId") && (
              <a href="#cancel" tabIndex={0} onClick={clearCategoryFilter}>
                <Tip text={__("Clear filter")} placement="bottom">
                  <Icon icon="cancel-1" />
                </Tip>
              </a>
            )}
          </Section.QuickButtons>
        </Section.Title>
      </>
    );
  };

  const renderCategoryList = () => {
    const { voucherCampaignsCount, loading } = props;

    return (
      <DataWithLoader
        data={renderContent()}
        loading={loading}
        count={voucherCampaignsCount}
        emptyText="There is no voucher campaigns"
        emptyIcon="folder-2"
        size="small"
      />
    );
  };

  return (
    <Sidebar hasBorder>
      <Section maxHeight={188} $collapsible={props.voucherCampaignsCount > 5}>
        {renderCategoryHeader()}
        {renderCategoryList()}
      </Section>
    </Sidebar>
  );
};

export default List;
