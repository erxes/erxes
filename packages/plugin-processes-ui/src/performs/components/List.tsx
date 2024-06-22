import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import Form from "../containers/Form";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import PerformSidebar from "./Sidebar";
import React, { useState } from "react";
import Row from "./Row";
import Table from "@erxes/ui/src/components/table";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "coreui/utils";
import {
  BarItems,
  FieldStyle,
  SidebarCounter,
} from "@erxes/ui/src/layout/styles";
import { Count } from "@erxes/ui/src/styles/main";
import { IPerform } from "../types";
import { menuNavs } from "../../constants";
import { useLocation, useNavigate } from "react-router-dom";

interface IProps {
  queryParams: any;
  performs: IPerform[];
  performsCount: number;
  loading: boolean;
  removePerform: (_id: string) => void;
}

const List = (props: IProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [overallWorkPercent, setOverallWorkPercent] = useState(0);

  const renderView = (name: string, variable: string) => {
    const defaultName = "-";

    return (
      <li>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{variable || defaultName}</SidebarCounter>
      </li>
    );
  };

  const renderProducts = (name: string, products: any[]) => {
    const result: React.ReactNode[] = [];

    result.push(
      <li>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{(products || []).length}</SidebarCounter>
      </li>
    );

    for (const product of products) {
      const { quantity, uom } = product;
      const productName = product.product ? product.product.name : "not name";

      result.push(renderView(productName, quantity + "/" + uom + "/"));
    }

    return result;
  };

  const renderRow = () => {
    const { performs, removePerform } = props;
    return (performs || []).map((perform) => (
      <Row key={perform._id} perform={perform} removePerform={removePerform} />
    ));
  };

  const renderCount = (performsCount) => {
    return (
      <Count>
        {performsCount} performance{performsCount > 1 && "s"}
      </Count>
    );
  };

  const { performsCount, loading, queryParams } = props;

  const trigger = (
    <Button btnStyle="success" icon="plus-circle">
      {__("Add performance")}
    </Button>
  );

  const modalContent = (props) => <Form {...props} />;

  const actionBarRight = (
    <BarItems>
      <ModalTrigger
        title={__("Add Performance")}
        size="xl"
        trigger={trigger}
        autoOpenKey="showProductModalz"
        content={modalContent}
      />
    </BarItems>
  );

  const content = (
    <>
      {renderCount(performsCount || 0)}
      <Table $hover={true}>
        <thead>
          <tr>
            <th>{__("Work")}</th>
            <th>{__("Type")}</th>
            <th>{__("StartAt")}</th>
            <th>{__("EndAt")}</th>
            <th>{__("Count")}</th>
            <th>{__("Description")}</th>
            <th>{__("Spend products")}</th>
            <th>{__("Receipt products")}</th>
            <th>{__("Spend Branch")}</th>
            <th>{__("Spend Department")}</th>
            <th>{__("Receipt Branch")}</th>
            <th>{__("Receipt Department")}</th>

            <th>{__("Status")}</th>
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
      leftSidebar={<PerformSidebar queryParams={queryParams} />}
      footer={<Pagination count={performsCount || 0} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={performsCount || 0}
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
