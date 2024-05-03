import { DataWithLoader, Icon, Tip } from "@erxes/ui/src/components";
import { Sidebar, Wrapper } from "@erxes/ui/src/layout";
import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import { IDonateCampaign } from "../../../configs/donateCampaign/types";
import { Link } from "react-router-dom";
import React from "react";
import { SidebarListItem } from "../../common/styles";
import queryString from "query-string";

const { Section } = Wrapper.Sidebar;

interface IProps {
  queryParams: any;
  refetch: any;
  donateCampaigns: IDonateCampaign[];
  donateCampaignsCount: number;
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
    const currentGroup = queryParams.campaignId || "";

    return currentGroup === id;
  };

  const renderContent = () => {
    const { donateCampaigns, queryParams } = props;

    const otherParams = { ...queryParams };
    delete otherParams.campaignId;
    const qryString = queryString.stringify(otherParams);

    const result: React.ReactNode[] = [];

    for (const campaign of donateCampaigns || []) {
      const name = `${campaign.title} (${campaign.donatesCount})`;

      result.push(
        <SidebarListItem
          key={campaign._id}
          $isActive={isActive(campaign?._id || "")}
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
          <Link to={`/erxes-plugin-loyalty/settings/donate`}>
            <Icon icon="cog" />
            {__("Manage Donate Campaigns")}
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
    const { donateCampaignsCount, loading } = props;

    return (
      <DataWithLoader
        data={renderContent()}
        loading={loading}
        count={donateCampaignsCount}
        emptyText="There is no donate campaigns"
        emptyIcon="folder-2"
        size="small"
      />
    );
  };

  return (
    <Sidebar hasBorder>
      <Section maxHeight={188} $collapsible={props.donateCampaignsCount > 5}>
        {renderCategoryHeader()}
        {renderCategoryList()}
      </Section>
    </Sidebar>
  );
};

export default List;
