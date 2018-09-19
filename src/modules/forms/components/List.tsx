import {
  Button,
  CountsByTag,
  DataWithLoader,
  FormControl,
  Pagination,
  Table
} from "modules/common/components";
import { __ } from "modules/common/utils";
import { Wrapper } from "modules/layout/components";
import { BarItems } from "modules/layout/styles";
import { TaggerPopover } from "modules/tags/components";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { ITag } from "../../tags/types";
import { IFormIntegration } from "../types";
import { Row } from "./";

type Props = {
  integrations: IFormIntegration[];
  tags: ITag[];
  bulk: IFormIntegration[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  totalCount: number;
  tagsCount: any;
  toggleBulk: (target: IFormIntegration, toAdd: boolean) => void;
  toggleAll: (bulk: IFormIntegration[], name: string) => void;
  loading: boolean;
  remove: (_id: string, callback: () => void) => void;
};

class List extends Component<Props, {}> {
  constructor(props: Props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange() {
    const { toggleAll, integrations } = this.props;
    toggleAll(integrations, "integrations");
  }

  renderRow() {
    const { integrations, remove, bulk, toggleBulk } = this.props;

    return integrations.map(integration => (
      <Row
        key={integration._id}
        isChecked={bulk.includes(integration)}
        toggleBulk={toggleBulk}
        integration={integration}
        remove={remove}
      />
    ));
  }

  render() {
    const {
      totalCount,
      tagsCount,
      loading,
      tags,
      bulk,
      emptyBulk,
      isAllSelected
    } = this.props;

    let actionBarLeft = null;

    if (bulk.length > 0) {
      const tagButton = (
        <Button btnStyle="simple" size="small" icon="downarrow">
          Tag
        </Button>
      );

      actionBarLeft = (
        <BarItems>
          <TaggerPopover
            type="integration"
            successCallback={emptyBulk}
            targets={bulk}
            trigger={tagButton}
          />
        </BarItems>
      );
    }

    const actionBarRight = (
      <Link to="/forms/create">
        <Button btnStyle="success" size="small" icon="add">
          {__("Create lead")}
        </Button>
      </Link>
    );

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    const sidebar = (
      <Wrapper.Sidebar>
        <CountsByTag
          tags={tags}
          manageUrl={"tags/integration"}
          counts={tagsCount}
          loading={false}
        />;
      </Wrapper.Sidebar>
    );

    const content = (
      <Table whiteSpace="nowrap" hover>
        <thead>
          <tr>
            <th>
              <FormControl
                componentClass="checkbox"
                checked={isAllSelected}
                onChange={this.onChange}
              />
            </th>
            <th>{__("Name")}</th>
            <th>{__("Brand")}</th>
            <th>{__("Views")}</th>
            <th>{__("Conversion rate")}</th>
            <th>{__("Contacts gathered")}</th>
            <th>{__("Created at")}</th>
            <th>{__("Created by")}</th>
            <th>{__("Tags")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody id="integrations">{this.renderRow()}</tbody>
      </Table>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: __("Leads") }]} />}
        leftSidebar={sidebar}
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={totalCount}
            emptyText="There is no lead."
            emptyImage="/images/robots/robot-03.svg"
          />
        }
      />
    );
  }
}

export default List;
