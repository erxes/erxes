import Form from "../../containers/label/LabelsForm";
import React, { useRef } from "react";
import Sidebar from "./Sidebar";
import SidebarWrapper from "../Sidebar";
import { __, Alert, confirm, router } from "@erxes/ui/src/utils";
import { BarItems, Wrapper } from "@erxes/ui/src/layout";
import {
  Button,
  DataWithLoader,
  FormControl,
  Icon,
  ModalTrigger,
  Table,
} from "@erxes/ui/src/components";
import { ISPLabel } from "../../types";
import Row from "./LabelsRow";
import { Title } from "@erxes/ui-settings/src/styles";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  spLabels: ISPLabel[];
  totalCount: number;
  loading: boolean;
  isAllSelected: boolean;
  toggleAll: (targets: ISPLabel[], containerId: string) => void;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { spLabelIds: string[] }, emptyBulk: () => void) => void;
  searchValue: string;
  filterStatus: string;
  minMultiplier: number;
  maxMultiplier: number;
};

const breadcrumb = [
  { title: __("Settings"), link: "/settings" },
  { title: __("Sales Plans Labels") },
];

const List = (props: Props) => {
  const {
    queryParams,
    isAllSelected,
    totalCount,
    loading,
    spLabels,
    bulk,
    searchValue,
    remove,
    toggleBulk,
    toggleAll,
    emptyBulk,
  } = props;

  const [search, setSearch] = React.useState(searchValue || "");
  const timerRef = useRef<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = e.target.value;
    setSearch(value);

    timerRef.current = window.setTimeout(() => {
      router.setParams(navigate, location, { searchValue: value });
      router.removeParams(navigate, location, "page");
    }, 500);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;

    e.target.value = "";
    e.target.value = tmpValue;
  };

  const renderRow = () => {
    return spLabels.map((spLabel) => (
      <Row
        key={spLabel._id}
        spLabel={spLabel}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(spLabel)}
      />
    ));
  };

  const modalContent = (formProps) => {
    return <Form {...formProps} />;
  };

  const removeSPLabels = (spLabels) => {
    const spLabelIds: string[] = [];

    spLabels.forEach((spLabel) => {
      spLabelIds.push(spLabel._id);
    });

    remove({ spLabelIds }, emptyBulk);
  };

  const actionBarRight = () => {
    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            removeSPLabels(bulk);
          })
          .catch((error) => {
            Alert.error(error.message);
          });

      return (
        <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
          Remove
        </Button>
      );
    }

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add label
      </Button>
    );

    return (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__("Type to search")}
          onChange={handleSearch}
          value={search}
          autoFocus={true}
          onFocus={moveCursorAtTheEnd}
        />
        <ModalTrigger
          title="Add label"
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={modalContent}
        />
      </BarItems>
    );
  };

  const renderActionBar = () => {
    const leftActionBar = <Title>{__("Sales Plans Labels")}</Title>;

    return <Wrapper.ActionBar left={leftActionBar} right={actionBarRight()} />;
  };

  const renderContent = () => {
    return (
      <Table $hover={true}>
        <thead>
          <tr>
            <th style={{ width: 60 }}>
              <FormControl
                checked={isAllSelected}
                componentclass="checkbox"
                onChange={() => toggleAll(spLabels, "spLabels")}
              />
            </th>
            <th>{__("Title")}</th>
            <th>{__("Effect")}</th>
            <th>{__("Color")}</th>
            <th>{__("Status")}</th>
          </tr>
        </thead>
        <tbody>{renderRow()}</tbody>
      </Table>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Sales Plans Labels")}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={renderActionBar()}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={totalCount}
          emptyText="There is no data"
          emptyImage="/images/actions/5.svg"
        />
      }
      leftSidebar={
        <SidebarWrapper queryParams={queryParams} children={Sidebar} />
      }
      transparent={true}
      hasBorder
    />
  );
};

export default List;
