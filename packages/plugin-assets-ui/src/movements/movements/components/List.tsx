import {
  BarItems,
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  Table,
  Tip,
  Wrapper,
  __,
  router
} from "@erxes/ui/src";
import { FlexRow, Title } from "@erxes/ui-settings/src/styles";
import React, { useRef, useState } from "react";

import { ContainerBox } from "../../../style";
import Form from "../containers/Form";
import { IMovementType } from "../../../common/types";
import Row from "./Row";
import Sidebar from "./Sidebar";
import { menuMovements } from "../../../common/constant";

type Props = {
  movements: IMovementType[];
  totalCount: number;
  loading: boolean;
  navigate: any;
  location: any;
  queryParams: any;
  isAllSelected: boolean;
  remove: (ids: string[]) => void;
  toggleAll: (targets: any, containerId: string) => void;
  toggleBulk: (target: any, toAdd: boolean) => void;
};

const List = (props: Props) => {
  const {
    movements,
    totalCount,
    navigate,
    location,
    queryParams,
    loading,
    remove,
    isAllSelected,
    toggleAll,
    toggleBulk
  } = props;

  const [searchValue, setSearchValue] = useState(queryParams.searchValue || "");
  const [selectedRows, setSelectedRows] = useState<any>([]);

  const timerRef = useRef<number | null>(null);

  const handleSearch = e => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = e.target.value;

    setSearchValue(value);

    timerRef.current = window.setTimeout(() => {
      router.setParams(navigate, location, {
        searchValue: value,
        page: undefined
      });
    }, 500);
  };

  const renderFormContent = formProps => {
    const updatedProps = {
      ...formProps,
      queryParams: queryParams || {}
    };

    return <Form {...updatedProps} />;
  };

  const onchange = () => {
    toggleAll(movements, "movements");

    setSelectedRows(
      !isAllSelected ? movements.map(movement => movement._id || "") : []
    );
  };

  const handleSelecteRow = (
    movement: IMovementType,
    movementId: string,
    isChecked?: boolean
  ) => {
    toggleBulk(movement, isChecked!);

    if (!isChecked) {
      const newSelectedRow = selectedRows.filter(item => item !== movementId);
      return setSelectedRows(newSelectedRow);
    }
    setSelectedRows([...selectedRows, movementId]);
  };

  const renderRow = props => {
    return movements.map(movement => (
      <Row
        key={movement._id}
        movement={movement}
        navigate={navigate}
        toggleBulk={handleSelecteRow}
        isChecked={props.bulk.includes(movement)}
        queryParams={queryParams}
      />
    ));
  };

  const renderContent = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th style={{ width: 60 }}>
              <FormControl
                checked={isAllSelected}
                componentclass="checkbox"
                onChange={onchange}
              />
            </th>
            <th>{__("User")}</th>
            <th>{__("Moved At")}</th>
            <th>{__("Description")}</th>
            <th>{__("Created At")}</th>
            <th>{__("Modified At")}</th>
            <th>{__("Action")}</th>
          </tr>
        </thead>
        <tbody>{renderRow(props)}</tbody>
      </Table>
    );
  };

  const handleRemove = () => {
    remove(selectedRows);
    setSelectedRows([]);
  };

  const moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;

    e.target.value = "";
    e.target.value = tmpValue;
  };

  const renderRightActionBar = () => {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add Movement
      </Button>
    );

    if (selectedRows.length > 0) {
      return (
        <FlexRow>
          {selectedRows.length > 0 && (
            <Tip text="Remove movement" placement="bottom">
              <Button btnStyle="danger" icon="cancel-1" onClick={handleRemove}>
                Remove
              </Button>
            </Tip>
          )}
        </FlexRow>
      );
    }

    return (
      <FlexRow>
        <FormControl
          type="text"
          placeholder={__("Type to search")}
          onChange={handleSearch}
          value={searchValue}
          autoFocus={true}
          onFocus={moveCursorAtTheEnd}
        />
        <ModalTrigger
          title="Add Movement"
          content={renderFormContent}
          trigger={trigger}
          size="xl"
        />
      </FlexRow>
    );
  };

  const renderActionBar = () => {
    const rightActionBar = <BarItems>{renderRightActionBar()}</BarItems>;

    const leftActionBar = (
      <ContainerBox $row>
        <Title>{"All Movements"}</Title>
      </ContainerBox>
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
