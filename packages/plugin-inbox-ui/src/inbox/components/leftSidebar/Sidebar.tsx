import {
  AdditionalSidebar,
  DropdownWrapper,
  FlexCenter,
  LeftContent,
  RightItems,
  ScrollContent,
  SidebarActions,
  SidebarContent,
  ToggleButton
} from "./styles";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "@erxes/ui/src/components/Button";
import { CONVERSATION_STATUSES } from "../../constants";
import FilterToggler from "../../containers/leftSidebar/FilterToggler";
import { IConversation } from "@erxes/ui-inbox/src/inbox/types";
import { IUser } from "@erxes/ui/src/auth/types";
import Icon from "@erxes/ui/src/components/Icon";
import { InboxManagementActionConsumer } from "../../containers/InboxCore";
import { PopoverButton } from "@erxes/ui-inbox/src/inbox/styles";
import Resolver from "../../containers/Resolver";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import { StatusFilterPopover } from "../../containers/leftSidebar";
import { TAG_TYPES } from "@erxes/ui-tags/src/constants";
import Tagger from "../../containers/Tagger";
import { Transition } from "react-transition-group";
import { __ } from "coreui/utils";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { queries } from "@erxes/ui-inbox/src/inbox/graphql";

const DateFilter = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-DateFilter" */ "@erxes/ui/src/components/DateFilter"
    ),
  { height: "15px", width: "70px" }
);

const AssignBoxPopover = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-AssignBoxPopover" */ "../assignBox/AssignBoxPopover"
    )
);

const ConversationList = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-ConversationList" */ "../../containers/leftSidebar/ConversationList"
    )
);

const FilterList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Inbox-FilterList" */ "../../containers/leftSidebar/FilterList"
    )
);

type Props = {
  currentUser?: IUser;
  currentConversationId?: string;
  queryParams: any;
  bulk: IConversation[];
  toggleBulk: (target: IConversation[], toggleAdd: boolean) => void;
  emptyBulk: () => void;
  config: { [key: string]: boolean };
  toggleSidebar: (params: { isOpen: boolean }) => void;
  resolveAll: () => void;
};

const LeftSidebar: React.FC<Props> = props => {
  const { currentUser, currentConversationId, queryParams, bulk, toggleBulk } =
    props;

  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState<boolean>(
    props.config?.showAddition || false
  );
  const [counts, setItemCounts] = useState<any>({});

  const renderTrigger = (text: string) => {
    return (
      <PopoverButton>
        {__(text)} <Icon icon="angle-down" />
      </PopoverButton>
    );
  };

  const onToggleSidebar = () => {
    const { toggleSidebar } = props;

    setIsOpen(!isOpen);
    toggleSidebar({ isOpen: !isOpen });
  };

  const renderSidebarActions = () => {
    const { queryParams, bulk, emptyBulk } = props;

    if (bulk.length > 0) {
      return (
        <Sidebar.Header>
          <Resolver conversations={bulk} emptyBulk={emptyBulk} />
          <RightItems>
            <AssignBoxPopover
              targets={bulk}
              trigger={renderTrigger("Assign")}
            />

            <Tagger targets={bulk} trigger={renderTrigger("Tag")} />
          </RightItems>
        </Sidebar.Header>
      );
    }

    return (
      <Sidebar.Header>
        <FlexCenter>
          <ToggleButton
            id="btn-inbox-channel-visible"
            $isActive={isOpen}
            onClick={onToggleSidebar}
          >
            <Icon icon="subject" />
          </ToggleButton>
          {queryParams.status !== CONVERSATION_STATUSES.CLOSED && (
            <Button size="small" btnStyle="simple" onClick={props.resolveAll}>
              Resolve all
            </Button>
          )}
        </FlexCenter>
        <DropdownWrapper>
          <DateFilter
            queryParams={queryParams}
            countQuery={queries.totalConversationsCount}
            countQueryParam="conversationsTotalCount"
          />
          <StatusFilterPopover queryParams={queryParams} />
        </DropdownWrapper>
      </Sidebar.Header>
    );
  };

  const renderSidebarHeader = () => {
    return <SidebarActions>{renderSidebarActions()}</SidebarActions>;
  };

  const renderAdditionalSidebar = (refetchRequired: string) => {
    const { queryParams, currentUser } = props;

    if (!currentUser) {
      return null;
    }

    const setCounts = (counts: any) => {
      const current = { ...counts };

      setItemCounts({ ...current, ...counts });
    };

    return (
      <Transition
        in={isOpen}
        appear={true}
        timeout={300}
        // classNames="fade-in"
        unmountOnExit={true}
      >
        <SidebarContent>
          <ScrollContent>
            <FilterToggler
              groupText="Channels"
              toggleName="showChannels"
              manageUrl="/settings/channels"
            >
              <FilterList
                query={{
                  queryName: "channelsByMembers",
                  variables: { memberIds: [currentUser._id] },
                  dataName: "channelsByMembers"
                }}
                counts="byChannels"
                paramKey="channelId"
                queryParams={queryParams}
                refetchRequired={refetchRequired}
                setCounts={setCounts}
              />
            </FilterToggler>

            {
              <FilterToggler
                groupText="Segments"
                toggleName="showSegments"
                manageUrl="/segments?contentType=inbox:conversation"
              >
                <FilterList
                  query={{
                    queryName: "segmentList",
                    dataName: "segments",
                    variables: {
                      contentTypes: [TAG_TYPES.CONVERSATION]
                    }
                  }}
                  queryParams={queryParams}
                  counts="bySegment"
                  paramKey="segment"
                  icon="tag-alt"
                  refetchRequired={refetchRequired}
                  treeView={true}
                  setCounts={setCounts}
                />
              </FilterToggler>
            }

            <FilterToggler
              groupText="Brands"
              toggleName="showBrands"
              manageUrl="/settings/brands"
            >
              <FilterList
                query={{ queryName: "allBrands", dataName: "allBrands" }}
                counts="byBrands"
                queryParams={queryParams}
                paramKey="brandId"
                refetchRequired={refetchRequired}
                setCounts={setCounts}
              />
            </FilterToggler>

            <FilterToggler
              groupText="Integrations"
              toggleName="showIntegrations"
              manageUrl="/settings/integrations"
            >
              <FilterList
                query={{
                  queryName: "integrationsGetUsedTypes",
                  dataName: "integrationsGetUsedTypes"
                }}
                queryParams={queryParams}
                counts="byIntegrationTypes"
                paramKey="integrationType"
                refetchRequired={refetchRequired}
                setCounts={setCounts}
              />
            </FilterToggler>

            <FilterToggler
              groupText="Tags"
              toggleName="showTags"
              manageUrl="/settings/tags/inbox:conversation"
            >
              <FilterList
                query={{
                  queryName: "tagList",
                  dataName: "tags",
                  variables: {
                    type: TAG_TYPES.CONVERSATION,
                    perPage: 100
                  }
                }}
                queryParams={queryParams}
                counts="byTags"
                paramKey="tag"
                icon="tag-alt"
                refetchRequired={refetchRequired}
                multiple={true}
                treeView={true}
                setCounts={setCounts}
              />
            </FilterToggler>
          </ScrollContent>
        </SidebarContent>
      </Transition>
    );
  };

  return (
    <LeftContent $isOpen={isOpen}>
      <InboxManagementActionConsumer>
        {({ refetchRequired }) => (
          <AdditionalSidebar>
            {renderAdditionalSidebar(refetchRequired)}
          </AdditionalSidebar>
        )}
      </InboxManagementActionConsumer>
      <Sidebar
        wide={true}
        full={true}
        header={renderSidebarHeader()}
        hasBorder={true}
      >
        <ConversationList
          currentUser={currentUser}
          currentConversationId={currentConversationId}
          queryParams={queryParams}
          toggleRowCheckbox={toggleBulk}
          selectedConversations={bulk}
          counts={counts}
          location={location}
          navigate={navigate}
        />
      </Sidebar>
    </LeftContent>
  );
};

export default LeftSidebar;
