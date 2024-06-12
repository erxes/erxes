import {
  BarItems,
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  Table,
  Wrapper,
  __,
  router,
} from "@erxes/ui/src";
import { Title } from "@erxes/ui-settings/src/styles";
import React, { useRef, useState } from "react";

import Form from "../../movements/containers/Form";
import { IMovementItem } from "../../../common/types";
import Row from "./Row";
import Sidebar from "./Sidebar";
import { menuMovements } from "../../../common/constant";

type Props = {
  items: IMovementItem[];
  totalCount: number;
  location: any;
  navigate: any;
  queryParams: any;
  loading: boolean;
};

const List = (props: Props) => {
  const { items, totalCount, location, navigate, queryParams, loading } = props;

  const [searchValue, setSearchValue] = useState(queryParams.searchValue || "");
  const timerRef = useRef<number | null>(null);

  const handleSearch = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const searchValue = e.target.value;
    setSearchValue(searchValue);

    timerRef.current = window.setTimeout(() => {
      router.setParams(navigate, location, { searchValue, page: undefined });
    }, 500);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;

    e.target.value = "";
    e.target.value = tmpValue;
  };

  const renderFormContent = (formProps) => {
    const updatedProps = {
      ...formProps,
      queryParams: queryParams || {},
    };

    return <Form {...updatedProps} />;
  };

  const renderForm = () => {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add Movement
      </Button>
    );

    return (
      <ModalTrigger
        title="Add Movement"
        content={renderFormContent}
        trigger={trigger}
        size="xl"
      />
    );
  };

  const renderRow = () => {
    return items.map((movement) => (
      <Row key={movement._id} item={movement} queryParams={queryParams} />
    ));
  };

  const renderContent = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__("Asset Name")}</th>
            <th>{__("Branch")}</th>
            <th>{__("Department")}</th>
            <th>{__("Team Member")}</th>
            <th>{__("Company")}</th>
            <th>{__("Customer")}</th>
            <th>{__("Created At")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>{renderRow()}</tbody>
      </Table>
    );
  };

  const renderActionBar = () => {
    const leftActionBar = <Title>{__("Asset Items")}</Title>;

    const rightActionBar = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__("Type to search")}
          onChange={handleSearch}
          value={searchValue}
          autoFocus={true}
          onFocus={moveCursorAtTheEnd}
        />
        {renderForm()}
      </BarItems>
    );

    return <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />;
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={"Asset Movement Items"}
          submenu={menuMovements}
        />
      }
      actionBar={renderActionBar()}
      content={
        <DataWithLoader
          loading={loading || false}
          data={renderContent()}
          count={totalCount}
          emptyImage="/images/actions/5.svg"
          emptyText={__("No data")}
        />
      }
      hasBorder={true}
      leftSidebar={
        <Sidebar
          navigate={navigate}
          location={location}
          queryParams={queryParams}
        />
      }
      footer={<Pagination count={totalCount} />}
    />
  );
};

export default List;
