import { AutomationsCount, IAutomation } from "../types";
import { __, router } from "@erxes/ui/src/utils";

import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import { EmptyContent } from "../styles";
import FormControl from "@erxes/ui/src/components/form/Control";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import React from "react";
import Row from "./Row";
import Sidebar from "./Sidebar";
import { TAG_TYPES } from "@erxes/ui-tags/src/constants";
import Table from "@erxes/ui/src/components/table";
import TaggerPopover from "@erxes/ui-tags/src/components/TaggerPopover";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { isEnabled } from "@erxes/ui/src/utils/core";
import withTableWrapper from "@erxes/ui/src/components/table/withTableWrapper";

interface IProps {
  automations: IAutomation[];
  loading: boolean;
  navigate: any;
  location: any;
  searchValue: string;
  totalCount: number;
  toggleBulk: () => void;
  toggleAll: (targets: IAutomation[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  addAutomation: () => void;
  removeAutomations: (
    doc: { automationIds: string[] },
    emptyBulk: () => void
  ) => void;
  archiveAutomations: (
    doc: { automationIds: string[]; isRestore?: boolean },
    emptyBulk: () => void
  ) => void;
  queryParams: any;
  exportAutomations: (bulk: string[]) => void;
  duplicate: (_id: string) => void;
  refetch?: () => void;
  renderExpandButton?: any;
  isExpand?: boolean;
  counts: AutomationsCount;
}

type State = {
  searchValue?: string;
};

class AutomationsList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  onChange = () => {
    const { toggleAll, automations } = this.props;

    toggleAll(automations, "automations");
  };

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { navigate, location } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });

    this.timer = setTimeout(() => {
      router.setParams(navigate, location, { searchValue, page: undefined });
    }, 500);
  };

  removeAutomations = automations => {
    const automationIds: string[] = [];

    automations.forEach(automation => {
      automationIds.push(automation._id);
    });

    this.props.removeAutomations({ automationIds }, this.props.emptyBulk);
  };

  archiveAutomations = automations => {
    const automationIds: string[] = automations.map(
      automation => automation._id
    );

    const isRestore = this.props?.queryParams?.status === "archived";

    this.props.archiveAutomations(
      { automationIds, isRestore },
      this.props.emptyBulk
    );
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  afterTag = () => {
    this.props.emptyBulk();

    if (this.props.refetch) {
      this.props.refetch();
    }
  };

  render() {
    const {
      navigate,
      loading,
      toggleBulk,
      duplicate,
      bulk,
      isAllSelected,
      totalCount,
      queryParams,
      isExpand,
      counts,
      location,
      addAutomation,
      emptyBulk
    } = this.props;

    const automations = this.props.automations || [];

    const mainContent = (
      <withTableWrapper.Wrapper>
        <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentclass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              <th>{__("Name")}</th>
              <th>{__("Status")}</th>
              <th>{__("Triggers")}</th>
              <th>{__("Action")}</th>
              <th>{__("Tags")}</th>
              <th>{__("Last updated by")}</th>
              <th>{__("Created by")}</th>
              <th>{__("Last update")}</th>
              <th>{__("Created date")}</th>
              <th>{__("Actions")}</th>
            </tr>
          </thead>
          <tbody id="automations" className={isExpand ? "expand" : ""}>
            {(automations || []).map(automation => (
              <Row
                key={automation._id}
                automation={automation}
                isChecked={bulk.includes(automation)}
                navigate={navigate}
                removeAutomations={this.removeAutomations}
                toggleBulk={toggleBulk}
                duplicate={duplicate}
              />
            ))}
          </tbody>
        </Table>
      </withTableWrapper.Wrapper>
    );

    let actionBarLeft: React.ReactNode;

    if (bulk.length > 0) {
      actionBarLeft = (
        <BarItems>
          <Button
            btnStyle="danger"
            size="small"
            icon="cancel-1"
            onClick={() => this.removeAutomations(bulk)}
          >
            Remove
          </Button>
          <Button
            btnStyle="simple"
            size="small"
            icon="archive-alt"
            onClick={() => this.archiveAutomations(bulk)}
          >
            {queryParams.status === "archived" ? "Restore" : "Archive"}
          </Button>
          <TaggerPopover
            type={TAG_TYPES.AUTOMATION}
            successCallback={emptyBulk}
            singleSelect
            targets={bulk}
            trigger={
              <Button btnStyle="simple" size="small" icon="tag-alt">
                Tag
              </Button>
            }
          />
        </BarItems>
      );
    }

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__("Type to search")}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />

        <Button
          btnStyle="success"
          size="small"
          icon="plus-circle"
          onClick={addAutomation}
        >
          {__("Create an automation")}
        </Button>
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__("Automations")}
            breadcrumb={[{ title: __("Automations") }]}
            queryParams={queryParams}
          />
        }
        actionBar={actionBar}
        leftSidebar={
          <Sidebar
            counts={counts || ({} as any)}
            location={location}
            navigate={navigate}
            queryParams={queryParams}
          />
        }
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={(automations || []).length}
            emptyContent={
              <EmptyContent>
                <img src="/images/actions/automation.svg" alt="empty-img" />

                <p>
                  <b>{__("You don’t have any automations yet")}.</b>
                  {__(
                    "Automatically execute repetitive tasks and make sure nothing falls through the cracks"
                  )}
                  .
                </p>
              </EmptyContent>
            }
          />
        }
        hasBorder
      />
    );
  }
}

export default withTableWrapper("Automation", AutomationsList);
