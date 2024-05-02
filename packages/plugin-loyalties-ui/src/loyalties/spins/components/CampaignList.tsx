import { DataWithLoader, Icon, Tip } from "@erxes/ui/src/components";
import { Sidebar, Wrapper } from "@erxes/ui/src/layout";
import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import { ISpinCampaign } from "../../../configs/spinCampaign/types";
import { Link } from "react-router-dom";
import React from "react";
import { SidebarListItem } from "../../common/styles";
import queryString from "query-string";

const { Section } = Wrapper.Sidebar;

interface IProps {
  queryParams: any;
  refetch: any;
  spinCampaigns: ISpinCampaign[];
  spinCampaignsCount: number;
  loading: boolean;
}

const List = (props: IProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const clearCategoryFilter = () => {
    router.setParams(navigate, location, { campaignId: null });
  };

  const isActive = (id: string) => {
    const { queryParams } = props;
    const currentGroup = queryParams.campaignId || "";

    return currentGroup === id;
  };

  const renderContent = () => {
    const { spinCampaigns, queryParams } = props;

    const otherParams = { ...queryParams };
    delete otherParams.campaignId;
    const qryString = queryString.stringify(otherParams);

    const result: React.ReactNode[] = [];

    for (const campaign of spinCampaigns || []) {
      const name = `${campaign.title} (${campaign.spinsCount})`;

      result.push(
        <SidebarListItem
          key={campaign._id}
          $isActive={campaign._id ? isActive(campaign._id) : false}
        >
          <Link to={`?${qryString}&campaignId=${campaign._id}`}>{name}</Link>
        </SidebarListItem>
      );
    }

    return result;
  };

  const renderCategoryHeader = () => {
    return (
      <>
        <Section.Title>
          <Link to={`/erxes-plugin-loyalty/settings/spin`}>
            <Icon icon="cog" />
            {__("Manage Spin Campaigns")}
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
    const { spinCampaignsCount, loading } = props;

    return (
      <DataWithLoader
        data={renderContent()}
        loading={loading}
        count={spinCampaignsCount}
        emptyText="There is no spin campaigns"
        emptyIcon="folder-2"
        size="small"
      />
    );
  };

  return (
    <Sidebar hasBorder={true}>
      <Section maxHeight={188} $collapsible={props.spinCampaignsCount > 5}>
        {renderCategoryHeader()}
        {renderCategoryList()}
      </Section>
    </Sidebar>
  );
};

export default List;
