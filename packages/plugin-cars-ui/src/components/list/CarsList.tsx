import {
  Alert,
  BarItems,
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  SortHandler,
  Table,
  Wrapper
} from "@erxes/ui/src";
import { FlexRow, Title } from "@erxes/ui-settings/src/styles";
import React, { useRef, useState } from "react";
import { __, router } from "@erxes/ui/src/utils/core";
import { useLocation, useNavigate } from "react-router-dom";

import CarForm from "../../containers/CarForm";
import CarRow from "./CarRow";
import CarsMerge from "../detail/CarsMerge";
import { CarsTableWrapper } from "../../styles";
import { ICar } from "../../types";
import Sidebar from "./Sidebar";
import TaggerPopover from "@erxes/ui-tags/src/components/TaggerPopover";
import { confirm } from "@erxes/ui/src/utils";

type Props = {
  cars: ICar[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: ICar[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  remove: (doc: { carIds: string[] }, emptyBulk: () => void) => void;
  merge: () => void;
  queryParams: any;
};

const CarsList = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    cars,
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
    queryParams
  } = props;

  const [search, setSearch] = useState<string>(searchValue || "");
  const timerRef = useRef<number | null>(null);

  const onChange = () => {
    toggleAll(cars, "cars");
  };

  const handleSearch = e => {
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

  const removeCars = cars => {
    const carIds: string[] = [];

    cars.forEach(car => {
      carIds.push(car._id);
    });

    remove({ carIds }, emptyBulk);
  };

  const moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const carForm = formProps => {
    return <CarForm {...formProps} queryParams={queryParams} />;
  };

  const carsMerge = formProps => {
    return <CarsMerge {...formProps} objects={bulk} save={merge} />;
  };

  const renderActionBarRight = () => {
    const addTrigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add car
      </Button>
    );

    const mergeButton = (
      <Button btnStyle="primary" icon="merge">
        Merge
      </Button>
    );

    const tagButton = (
      <Button btnStyle="simple" icon="tag-alt">
        Tag
      </Button>
    );

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            removeCars(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      return (
        <>
          {bulk.length === 2 && (
            <ModalTrigger
              title="Merge Cars"
              size="lg"
              trigger={mergeButton}
              content={carsMerge}
            />
          )}

          <TaggerPopover
            type={"cars:car"}
            successCallback={emptyBulk}
            targets={bulk}
            trigger={tagButton}
            refetchQueries={["productCountByTags"]}
          />

          <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
            Delete
          </Button>
        </>
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
          title={__("New car")}
          trigger={addTrigger}
          autoOpenKey="showCarModal"
          size="lg"
          content={carForm}
          backDrop="static"
        />
      </BarItems>
    );
  };

  const renderActionBar = () => {
    const actionBarLeft = <Title>{__(`Cars (${totalCount})`)}</Title>;

    const actionBarRight = <FlexRow>{renderActionBarRight()}</FlexRow>;

    return <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />;
  };

  const renderContent = () => {
    return (
      <CarsTableWrapper>
        <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentclass="checkbox"
                  onChange={onChange}
                />
              </th>
              <th>
                <SortHandler
                  sortField={"plateNumber"}
                  label={__("Plate Number")}
                />
              </th>
              <th>
                <SortHandler sortField={"vinNumber"} label={__("Vin Number")} />
              </th>
              <th>
                <SortHandler
                  sortField={"vintageYear"}
                  label={__("Vintage Year")}
                />
              </th>
              <th>
                <SortHandler
                  sortField={"importYear"}
                  label={__("Import Year")}
                />
              </th>
              <th>
                <SortHandler
                  sortField={"description"}
                  label={__("Description")}
                />
              </th>
            </tr>
          </thead>
          <tbody id="cars">
            {cars.map(car => (
              <CarRow
                car={car}
                isChecked={bulk.includes(car)}
                key={car._id}
                toggleBulk={toggleBulk}
              />
            ))}
          </tbody>
        </Table>
      </CarsTableWrapper>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Cars`)}
          queryParams={queryParams}
          breadcrumb={[{ title: "Cars" }]}
        />
      }
      actionBar={renderActionBar()}
      footer={<Pagination count={totalCount} />}
      leftSidebar={
        <Sidebar
          loadingMainQuery={loading}
          queryParams={queryParams}
        />
      }
      hasBorder={true}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={cars.length}
          emptyText={__("Add in your first car!")}
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default CarsList;
