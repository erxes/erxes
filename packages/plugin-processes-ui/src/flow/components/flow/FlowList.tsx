import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import FormControl from "@erxes/ui/src/components/form/Control";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Table from "@erxes/ui/src/components/table";
import { Count, Title } from "@erxes/ui/src/styles/main";
import { Alert, confirm, router } from "@erxes/ui/src/utils";
import { __ } from "coreui/utils";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { BarItems } from "@erxes/ui/src/layout/styles";
import React, { useState } from "react";
import CategoryList from "../../containers/flowCategory/CategoryList";
import { IFlowDocument } from "../../types";
import Row from "./FlowListRow";
import { menuSettings } from "../../../constants";
import { useLocation, useNavigate } from "react-router-dom";

interface IProps {
  queryParams: any;
  flows: IFlowDocument[];
  flowsTotalCount: number;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (doc: { flowIds: string[] }, emptyBulk: () => void) => void;
  addFlow: (isSub?: boolean) => void;
  toggleBulk: () => void;
  toggleAll: (targets: IFlowDocument[], containerId: string) => void;
  loading: boolean;
  searchValue: string;
}

const List = (props: IProps) => {
  let timer;
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState(props.searchValue);

  const renderRow = () => {
    const { flows, toggleBulk, bulk } = props;

    return flows.map((flow) => (
      <Row
        key={flow._id}
        flow={flow}
        history={navigate}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(flow)}
      />
    ));
  };

  const onChange = () => {
    const { toggleAll, flows } = props;
    toggleAll(flows, "flows");
  };

  const removeProducts = (flows) => {
    const flowIds: string[] = [];

    flows.forEach((jobRefer) => {
      flowIds.push(jobRefer._id);
    });

    props.remove({ flowIds }, props.emptyBulk);
  };

  const renderCount = (flowCount) => {
    return (
      <Count>
        {flowCount} flow{flowCount > 1 && "s"}
      </Count>
    );
  };

  const search = (e) => {
    if (timer) {
      clearTimeout(timer);
    }

    const searchValue = e.target.value;

    setSearchValue(searchValue);

    timer = setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue });
    }, 500);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;

    e.target.value = "";
    e.target.value = tmpValue;
  };

  const onClickCreateFlow = () => {
    props.addFlow();
  };

  const onClickCreateSubFlow = () => {
    props.addFlow(true);
  };

  const { flowsTotalCount, loading, queryParams, isAllSelected, bulk } = props;

  let actionBarRight = (
    <BarItems>
      <FormControl
        type="text"
        placeholder={__("Type to search")}
        onChange={search}
        value={searchValue}
        autoFocus={true}
        onFocus={moveCursorAtTheEnd}
      />
      <Button
        btnStyle="primary"
        size="small"
        icon="plus-circle"
        onClick={onClickCreateSubFlow}
      >
        {__("Create a SubFlow")}
      </Button>
      <Button
        btnStyle="success"
        size="small"
        icon="plus-circle"
        onClick={onClickCreateFlow}
      >
        {__("Create a flow")}
      </Button>
    </BarItems>
  );

  let content = (
    <>
      {renderCount(flowsTotalCount)}
      <Table $hover={true}>
        <thead>
          <tr>
            <th style={{ width: 60 }}>
              <FormControl
                checked={isAllSelected}
                componentclass="checkbox"
                onChange={onChange}
              />
            </th>
            <th>{__("Type")}</th>
            <th>{__("Name")}</th>
            <th>{__("Product")}</th>
            <th>{__("Latest Branch")}</th>
            <th>{__("Latest Department")}</th>
            <th>{__("Status")}</th>
            <th>{__("Is match")}</th>
            <th>{__("Jobs count")}</th>
          </tr>
        </thead>
        <tbody>{renderRow()}</tbody>
      </Table>
    </>
  );

  if (flowsTotalCount === 0) {
    content = (
      <EmptyState image="/images/actions/8.svg" text="No Brands" size="small" />
    );
  }

  if (bulk.length > 0) {
    const onClick = () =>
      confirm()
        .then(() => {
          removeProducts(bulk);
        })
        .catch((error) => {
          Alert.error(error.message);
        });

    actionBarRight = (
      <BarItems>
        <Button
          btnStyle="danger"
          size="small"
          icon="cancel-1"
          onClick={onClick}
        >
          Remove
        </Button>
      </BarItems>
    );
  }

  const actionBarLeft = <Title>{__("Flows list")}</Title>;

  return (
    <Wrapper
      header={<Wrapper.Header title={__("Flow")} submenu={menuSettings} />}
      actionBar={
        <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
      }
      leftSidebar={<CategoryList queryParams={queryParams} />}
      footer={<Pagination count={flowsTotalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={flowsTotalCount}
          emptyText="There is no data 2022"
          emptyImage="/images/actions/5.svg"
        />
      }
      hasBorder={true}
      transparent={true}
    />
  );
};

export default List;
