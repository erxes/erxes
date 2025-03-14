import { Alert } from "@erxes/ui/src";
import Button from "@erxes/ui/src/components/Button";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Spinner from "@erxes/ui/src/components/Spinner";
import FormControl from "@erxes/ui/src/components/form/Control";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Table from "@erxes/ui/src/components/table";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { BarItems } from "@erxes/ui/src/layout/styles";
import { Title } from "@erxes/ui/src/styles/main";
import { confirm } from "@erxes/ui/src/utils";
import { __, router } from "@erxes/ui/src/utils/core";
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CategoryList from "../../containers/CategoryList";
import { IProgram } from "../../types";
import Row from "./ProgramRow";

type Props = {
  programs: IProgram[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IProgram[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  remove: (doc: { programIds: string[] }, emptyBulk: () => void) => void;
  merge: () => void;
  queryParams: any;
};

const ProgramsList = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    programs,
    loading,
    searchValue,
    totalCount,
    toggleBulk,
    toggleAll,
    bulk,
    isAllSelected,
    emptyBulk,
    remove,
    merge,
    queryParams,
  } = props;

  const [search, setSearch] = useState<string>(searchValue || "");
  const timerRef = useRef<number | null>(null);

  const onChange = () => {
    toggleAll(programs, "cars");
  };

  const handleSearch = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = e.target.value;
    setSearch(value);

    timerRef.current = window.setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue: value });
    }, 500);
  };

  const removePrograms = (programs) => {
    const programIds: string[] = [];

    programs.forEach((program) => {
      programIds.push(program._id);
    });

    remove({ programIds }, emptyBulk);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const programForm = (formProps) => {
    return null;
  };

  const actionBarRight = () => {
    const addTrigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add program
      </Button>
    );

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            removePrograms(bulk);
          })
          .catch((error) => {
            Alert.error(error.message);
          });

      return (
        <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
          Delete
        </Button>
      );
    }

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
          title={__("New program")}
          trigger={addTrigger}
          autoOpenKey="showProgramModal"
          size="lg"
          content={programForm}
          backDrop="static"
        />
      </BarItems>
    );
  };

  const actionBarLeft = <Title>{`${"Programs"} (${totalCount})`}</Title>;

  const renderRow = () => {
    return programs.map((program) => (
      <Row
        key={program._id}
        program={program}
        toggleBulk={toggleBulk}
        isChecked={(bulk || []).map((b) => b._id).includes(program._id)}
        // duplicateProduct={duplicateProduct}
      />
    ));
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner objective={true} />;
    }

    if (totalCount === 0) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Programs"
          size="small"
        />
      );
    }

    return (
      <>
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
              <th>{__("Code")}</th>
              <th>{__("Name")}</th>
              <th>{__("Type")}</th>
              <th>{__("Category")}</th>
              <th>{__("Unit Price")}</th>
              <th>{__("Comment count")}</th>
            </tr>
          </thead>
          <tbody>{renderRow()}</tbody>
        </Table>
      </>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Programs`)}
          queryParams={queryParams}
          breadcrumb={[{ title: "Programs" }]}
        />
      }
      actionBar={
        <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight()} />
      }
      leftSidebar={<CategoryList queryParams={queryParams} />}
      footer={<Pagination count={totalCount} />}
      content={renderContent()}
      transparent={true}
      hasBorder={true}
    />
  );
};

export default ProgramsList;
