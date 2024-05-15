import { Alert, __, confirm, router } from "@erxes/ui/src/utils";
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  SortHandler,
  Table,
} from "@erxes/ui/src/components";
import {
  MainStyleCount as Count,
  MainStyleTitle as Title,
} from "@erxes/ui/src/styles/eindex";

import { BarItems } from "@erxes/ui/src/layout/styles";
import DonateForm from "../containers/Form";
import DonateRow from "./Row";
import { IDonate } from "../types";
import { IDonateCampaign } from "../../../configs/donateCampaign/types";
import { LoyaltiesTableWrapper } from "../../common/styles";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Wrapper } from "@erxes/ui/src/layout";
import { menuLoyalties } from "../../common/constants";
import { useLocation, useNavigate } from "react-router-dom";

interface IProps {
  donates: IDonate[];
  currentCampaign?: IDonateCampaign;
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IDonate[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeDonates: (doc: { donateIds: string[] }, emptyBulk: () => void) => void;
  queryParams: any;
}

const DonatesList = (props: IProps) => {
  let timer;
  const [searchValue, setSearchValue] = useState(props.searchValue);
  const location = useLocation();
  const navigate = useNavigate();

  const onChange = () => {
    const { toggleAll, donates } = props;
    toggleAll(donates, "donates");
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

  const removeDonates = (donates) => {
    const donateIds: string[] = [];

    donates.forEach((donate) => {
      donateIds.push(donate._id);
    });

    props.removeDonates({ donateIds }, props.emptyBulk);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const {
    donates,
    loading,
    toggleBulk,
    bulk,
    isAllSelected,
    totalCount,
    queryParams,
    currentCampaign,
  } = props;

  const mainContent = (
    <LoyaltiesTableWrapper>
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
              <SortHandler sortField={"createdAt"} label={__("Created")} />
            </th>
            <th>
              <SortHandler sortField={"ownerType"} label={__("Owner Type")} />
            </th>
            <th>
              <SortHandler sortField={"ownerId"} label={__("Owner")} />
            </th>
            <th>
              <SortHandler
                sortField={"donateScore"}
                label={__("Donate Score")}
              />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="donates">
          {donates.map((donate) => (
            <DonateRow
              donate={donate}
              isChecked={bulk.includes(donate)}
              key={donate._id}
              toggleBulk={toggleBulk}
              currentCampaign={currentCampaign}
              queryParams={queryParams}
            />
          ))}
        </tbody>
      </Table>
    </LoyaltiesTableWrapper>
  );

  const addTrigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add donate
    </Button>
  );

  const donateForm = (props) => {
    return <DonateForm {...props} queryParams={queryParams} />;
  };

  const actionBarRight = () => {
    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            removeDonates(bulk);
          })
          .catch((error) => {
            Alert.error(error.message);
          });

      return (
        <BarItems>
          <Button
            btnStyle="danger"
            size="small"
            icon="cancel-1"
            onClick={onClick}
          >
            Delete
          </Button>
        </BarItems>
      );
    }
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
          title="New donate"
          trigger={addTrigger}
          autoOpenKey="showDonateModal"
          content={donateForm}
          backDrop="static"
        />
      </BarItems>
    );
  };

  const actionBarLeft = (
    <Title>
      {(currentCampaign && `${currentCampaign.title}`) ||
        "All donate campaigns"}{" "}
    </Title>
  );
  const actionBar = (
    <Wrapper.ActionBar right={actionBarRight()} left={actionBarLeft} />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Donates`) + ` (${totalCount})`}
          submenu={menuLoyalties}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      leftSidebar={
        <Sidebar loadingMainQuery={loading} queryParams={queryParams} />
      }
      content={
        <>
          <Count>
            {totalCount} donate{totalCount > 1 && "s"}
          </Count>
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={donates.length}
            emptyText="Add in your first donate!"
            emptyImage="/images/actions/1.svg"
          />
        </>
      }
      hasBorder
    />
  );
};

export default DonatesList;
