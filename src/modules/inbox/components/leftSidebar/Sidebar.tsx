import { DateFilter, Icon } from "modules/common/components";
import { __ } from "modules/common/utils";
import { Resolver, Tagger } from "modules/inbox/containers";
import { ConversationList } from "modules/inbox/containers/leftSidebar";
import { queries } from "modules/inbox/graphql";
import { PopoverButton } from "modules/inbox/styles";
import { Sidebar } from "modules/layout/components";
import { TAG_TYPES } from "modules/tags/constants";
import * as React from "react";
import AssignBoxPopover from "../assignBox/AssignBoxPopover";
import FilterPopover from "./FilterPopover";
import StatusFilterPopover from "./StatusFilterPopover";
import { RightItems } from "./styles";

type Integrations = {
  _id: string;
  name: string;
};

type Props = {
  currentConversationId?: string;
  integrations: Integrations[];
  queryParams: any;
  history: any;
  totalCount: any;

  bulk: any;
  toggleBulk: (target: any, toggleAdd: boolean) => void;
};

class LeftSidebar extends React.Component<Props, {}> {
  renderTrigger(text: string) {
    return (
      <PopoverButton>
        {__(text)} <Icon icon="downarrow" />
      </PopoverButton>
    );
  }

  renderSidebarHeader() {
    const { queryParams, history, bulk } = this.props;

    if (bulk.length > 0) {
      return (
        <Sidebar.Header>
          <RightItems>
            <AssignBoxPopover
              targets={bulk}
              trigger={this.renderTrigger("Assign")}
            />

            <Tagger targets={bulk} trigger={this.renderTrigger("Tag")} />
            <Resolver conversations={bulk} />
          </RightItems>
        </Sidebar.Header>
      );
    }

    return (
      <Sidebar.Header>
        <FilterPopover
          buttonText="# Channel"
          popoverTitle="Filter by channel"
          query={{
            queryName: "channelList",
            dataName: "channels"
          }}
          counts="byChannels"
          paramKey="channelId"
          queryParams={queryParams}
          searchable
        />
        <DateFilter
          queryParams={queryParams}
          history={history}
          countQuery={queries.totalConversationsCount}
          countQueryParam="conversationsTotalCount"
        />
        <StatusFilterPopover queryParams={queryParams} />
      </Sidebar.Header>
    );
  }

  renderSidebarFooter() {
    const { integrations, queryParams } = this.props;

    return (
      <Sidebar.Footer>
        <FilterPopover
          buttonText="Brand"
          query={{ queryName: "brandList", dataName: "brands" }}
          counts="byBrands"
          popoverTitle="Filter by brand"
          placement="top"
          queryParams={queryParams}
          paramKey="brandId"
          searchable
        />

        <FilterPopover
          buttonText="Integration"
          fields={integrations}
          queryParams={queryParams}
          counts="byIntegrationTypes"
          paramKey="integrationType"
          popoverTitle="Filter by integrations"
          placement="top"
        />

        <FilterPopover
          buttonText="Tag"
          query={{
            queryName: "tagList",
            dataName: "tags",
            variables: {
              type: TAG_TYPES.CONVERSATION
            }
          }}
          queryParams={queryParams}
          counts="byTags"
          paramKey="tag"
          popoverTitle="Filter by tag"
          placement="top"
          icon="tag"
          searchable
        />
      </Sidebar.Footer>
    );
  }

  render() {
    const {
      totalCount,
      currentConversationId,
      history,
      queryParams,
      bulk,
      toggleBulk
    } = this.props;

    return (
      <Sidebar
        wide
        full
        header={this.renderSidebarHeader()}
        footer={this.renderSidebarFooter()}
      >
        <ConversationList
          currentConversationId={currentConversationId}
          totalCount={totalCount}
          history={history}
          queryParams={queryParams}
          toggleRowCheckbox={toggleBulk}
          selectedIds={bulk}
        />
      </Sidebar>
    );
  }
}

export default LeftSidebar;
