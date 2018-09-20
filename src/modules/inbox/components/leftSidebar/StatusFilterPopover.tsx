import gql from "graphql-tag";
import { Icon, Spinner } from "modules/common/components";
import { __, router } from "modules/common/utils";
import { queries } from "modules/inbox/graphql";
import { PopoverButton } from "modules/inbox/styles";
import { generateParams } from "modules/inbox/utils";
import { SidebarCounter, SidebarList } from "modules/layout/styles";
import * as React from "react";
import { withApollo } from "react-apollo";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { withRouter } from "react-router";

type Props = {
  history: any;
  client: any;
  queryParams: any;
};

type State = {
  counts: any;
  loading: boolean;
};

class StatusFilterPopover extends React.Component<Props, State> {
  private overlayTrigger;

  constructor(props) {
    super(props);

    this.state = {
      counts: {},
      loading: true
    };

    this.overlayTrigger = React.createRef();

    this.clearStatusFilter = this.clearStatusFilter.bind(this);
    this.onClick = this.onClick.bind(this);
    this.renderPopover = this.renderPopover.bind(this);
    this.renderSingleFilter = this.renderSingleFilter.bind(this);
  }

  onClick() {
    const { client, queryParams } = this.props;

    client
      .query({
        query: gql(queries.conversationCounts),
        variables: generateParams(queryParams)
      })
      .then(({ data, loading }) => {
        this.setState({ counts: data.conversationCounts, loading });
      });
  }

  clearStatusFilter() {
    router.setParams(this.props.history, {
      participating: "",
      status: "",
      unassigned: "",
      starred: ""
    });
  }

  renderSingleFilter(
    paramName: string,
    paramValue: string,
    countName: string,
    text: string,
    count: number
  ) {
    const { history } = this.props;

    const onClick = () => {
      // clear previous values
      this.clearStatusFilter();
      router.setParams(history, { [paramName]: paramValue });
    };

    return (
      <li>
        <a
          className={
            router.getParam(history, [paramName]) === paramValue ? "active" : ""
          }
          onClick={onClick}
        >
          {__(text)}
          <SidebarCounter>{count}</SidebarCounter>
        </a>
      </li>
    );
  }

  renderPopover() {
    const { loading, counts } = this.state;

    if (loading) {
      return (
        <Popover id="filter-popover" title={__("Filter by status")}>
          <Spinner objective />
        </Popover>
      );
    }

    return (
      <Popover id="filter-popover" title={__("Filter by status")}>
        <SidebarList>
          {this.renderSingleFilter(
            "unassigned",
            "true",
            "unassiged",
            "Unassigned",
            counts.unassigned
          )}
          {this.renderSingleFilter(
            "participating",
            "true",
            "participating",
            "Participating",
            counts.participating
          )}

          {this.renderSingleFilter(
            "status",
            "closed",
            "resolved",
            "Resolved",
            counts.resolved
          )}
        </SidebarList>
      </Popover>
    );
  }

  render() {
    return (
      <OverlayTrigger
        ref={this.overlayTrigger}
        trigger="click"
        placement="bottom"
        overlay={this.renderPopover()}
        container={this}
        rootClose
      >
        <PopoverButton onClick={() => this.onClick()}>
          {__("Status")}
          <Icon icon="downarrow" />
        </PopoverButton>
      </OverlayTrigger>
    );
  }
}

export default withRouter(withApollo(StatusFilterPopover));
