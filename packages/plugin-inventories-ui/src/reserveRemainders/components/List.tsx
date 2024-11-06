import React, { useState } from "react";
import Row from "./Row";
import Sidebar from "./Sidebar";
import { __, Alert, confirm, router } from "@erxes/ui/src/utils";
import { BarItems, Wrapper } from "@erxes/ui/src/layout";
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Table,
} from "@erxes/ui/src/components";
import { IReserveRem } from "../types";
import { MainStyleTitle as Title } from "@erxes/ui/src/styles/eindex";
import Form from "../containers/Form";
import { SUBMENU } from "../../constants";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import { useLocation, useNavigate } from 'react-router-dom';

type Props = {
  reserveRems: IReserveRem[];
  totalCount: number;
  isAllSelected: boolean;
  toggleAll: (targets: IReserveRem[], containerId: string) => void;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { reserveRemIds: string[] }, emptyBulk: () => void) => void;
  edit: (doc: IReserveRem) => void;
  searchValue: string;
};

const ReserveRems: React.FC<Props> = (props) => {
  let timer;
  const [searchValue, setSearchValue] = useState(props.searchValue || "");
  const {
    toggleAll,
    reserveRems,
    toggleBulk,
    bulk,
    edit,
    remove,
    emptyBulk,
    isAllSelected,
    totalCount,
    queryParams,
  } = props;
  const location = useLocation();
  const navigate = useNavigate();
  
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

  const onChange = () => {
    toggleAll(reserveRems, "reserveRems");
  };

  const renderRow = () => {
    return reserveRems.map((reserveRem) => (
      <Row
        key={reserveRem._id}
        reserveRem={reserveRem}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(reserveRem)}
        edit={edit}
      />
    ));
  };

  const modalContent = (props) => {
    return <Form {...props} />;
  };

  const removeReserveRems = (reserveRems) => {
    const reserveRemIds: string[] = [];

    reserveRems.forEach((reserveRem) => {
      reserveRemIds.push(reserveRem._id);
    });

    remove({ reserveRemIds }, emptyBulk);
  };

  const actionBarRight = () => {
    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            removeReserveRems(bulk);
          })
          .catch((error) => {
            Alert.error(error.message);
          });

      return (
        <Button
          btnStyle="danger"
          size="small"
          icon="cancel-1"
          onClick={onClick}
        >
          Remove
        </Button>
      );
    }

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add remainders
      </Button>
    );

    return (
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
          size={"lg"}
          title={__("Add label")}
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={modalContent}
        />
      </BarItems>
    );
  };

  const content = (
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
          <th>{__("Branch")}</th>
          <th>{__("Department")}</th>
          <th>{__("Product")}</th>
          <th>{__("Uom")}</th>
          <th>{__("Remainder")}</th>
          <th>{__("")}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__("Sales Year plans")} submenu={SUBMENU} />
      }
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__("Reserve Remainders")}</Title>}
          right={actionBarRight()}
        />
      }
      leftSidebar={<Sidebar queryParams={queryParams} />}
      content={
        <DataWithLoader
          data={content}
          loading={false}
          count={totalCount}
          emptyText={__("There is no data")}
          emptyImage="/images/actions/5.svg"
        />
      }
      footer={<Pagination count={totalCount} />}
      transparent={true}
      hasBorder
    />
  );
};

export default ReserveRems;
