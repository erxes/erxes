import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import Form from "../containers/WorkForm";
import FormControl from "@erxes/ui/src/components/form/Control";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import React, { useState } from "react";
import Row from "./WorkRow";
import Table from "@erxes/ui/src/components/table";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { router } from "@erxes/ui/src/utils";
import { __ } from "coreui/utils";
import { BarItems } from "@erxes/ui/src/layout/styles";
import { Count } from "@erxes/ui/src/styles/main";
import { IWorkDocument } from "../types";
import { menuNavs } from "../../constants";
import Sidebar from "./WorkSidebar";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Button from "@erxes/ui/src/components/Button";
import { useLocation, useNavigate } from "react-router-dom";

interface IProps {
  queryParams: any;
  works: IWorkDocument[];
  worksCount: number;
  loading: boolean;
  searchValue: string;
  removeWork: (id: string) => void;
}

const List = (props: IProps) => {
  let timer;
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState(props.searchValue);

  const renderRow = () => {
    const { works, removeWork } = props;
    return works.map((work) => (
      <Row key={work._id} work={work} removeWork={removeWork} />
    ));
  };

  const renderCount = (worksCount) => {
    return (
      <Count>
        {worksCount} work{worksCount > 1 && "s"}
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

  const { worksCount, loading, queryParams } = props;

  const trigger = (
    <Button btnStyle="success" icon="plus-circle">
      {__("Add work")}
    </Button>
  );

  const modalContent = (props) => <Form {...props} />;

  const actionBarRight = (
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
        title="Add Work"
        size="xl"
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={modalContent}
      />
    </BarItems>
  );

  const content = (
    <>
      {renderCount(worksCount || 0)}
      <Table $hover={true}>
        <thead>
          <tr>
            <th>{__("Name")}</th>
            <th>{__("Status")}</th>
            <th>{__("Flow")}</th>
            <th>{__("Count")}</th>
            <th>{__("Spend Branch")}</th>
            <th>{__("Spend Department")}</th>
            <th>{__("Receipt Branch")}</th>
            <th>{__("Receipt Department")}</th>
            <th>{__("Need products")}</th>
            <th>{__("Result products")}</th>
            <th>{__("Due Date")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>{renderRow()}</tbody>
      </Table>
    </>
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={__("Work")} submenu={menuNavs} />}
      actionBar={<Wrapper.ActionBar right={actionBarRight} />}
      leftSidebar={<Sidebar queryParams={queryParams} />}
      footer={<Pagination count={worksCount || 0} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={worksCount}
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
