import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import FormControl from "@erxes/ui/src/components/form/Control";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Table from "@erxes/ui/src/components/table";
import { Count, Title } from "@erxes/ui/src/styles/main";
import { Alert, confirm, router } from "@erxes/ui/src/utils";
import { __ } from "coreui/utils";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { BarItems } from "@erxes/ui/src/layout/styles";
import React, { useState } from "react";
import Form from "../../containers/refer/Form";
import CategoryList from "../../containers/category/List";
import { IJobRefer } from "../../types";
import Row from "./Row";
import { menuSettings } from "../../../constants";
import { useLocation, useNavigate } from 'react-router-dom';

interface IProps {
  queryParams: any;
  jobRefers: IJobRefer[];
  jobRefersCount: number;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (doc: { jobRefersIds: string[] }, emptyBulk: () => void) => void;
  toggleBulk: () => void;
  toggleAll: (targets: IJobRefer[], containerId: string) => void;
  loading: boolean;
  searchValue: string;
}

const List = (props: IProps) => {
  let timer;
  const location = useLocation();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState(props.searchValue);

  const renderRow = () => {
    const { jobRefers, toggleBulk, bulk } = props;

    return jobRefers.map((jobRefer) => (
      <Row
        key={jobRefer._id}
        jobRefer={jobRefer}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(jobRefer)}
      />
    ));
  };

  const onChange = () => {
    const { toggleAll, jobRefers } = props;
    toggleAll(jobRefers, "jobRefers");
  };

  const removeProducts = (jobRefers) => {
    const jobRefersIds: string[] = [];

    jobRefers.forEach((jobRefer) => {
      jobRefersIds.push(jobRefer._id);
    });

    props.remove({ jobRefersIds }, props.emptyBulk);
  };

  const renderCount = (productCount) => {
    return (
      <Count>
        {productCount} job{productCount > 1 && "s"}
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

  const { jobRefersCount, loading, queryParams, isAllSelected, bulk } = props;

  const trigger = (
    <Button btnStyle="success" icon="plus-circle">
      {__("Add job")}
    </Button>
  );

  const modalContent = (props) => <Form {...props} />;

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
      <ModalTrigger
        title={__("Add Job")}
        size="lg"
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={modalContent}
      />
    </BarItems>
  );

  let content = (
    <>
      {renderCount(jobRefersCount)}
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
            <th>{__("Name")}</th>
            <th>{__("Code")}</th>
            <th>{__("Type")}</th>
            <th>{__("Need Products")}</th>
            <th>{__("Result Products")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>{renderRow()}</tbody>
      </Table>
    </>
  );

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

  const actionBarLeft = <Title>{`${__("All jobs")}`}</Title>;

  return (
    <Wrapper
      header={<Wrapper.Header title={__("Job")} submenu={menuSettings} />}
      actionBar={
        <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
      }
      leftSidebar={<CategoryList queryParams={queryParams} />}
      footer={<Pagination count={jobRefersCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={jobRefersCount}
          emptyText="There is no data"
          emptyImage="/images/actions/5.svg"
        />
      }
      hasBorder={true}
      transparent={true}
    />
  );
};

export default List;
