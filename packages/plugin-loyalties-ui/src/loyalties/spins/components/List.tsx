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
import { ISpin } from "../types";
import { ISpinCampaign } from "../../../configs/spinCampaign/types";
import { LoyaltiesTableWrapper } from "../../common/styles";
import React, {useState} from "react";
import Sidebar from "./Sidebar";
import SpinForm from "../containers/Form";
import SpinRow from "./Row";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { menuLoyalties } from "../../common/constants";
import { useLocation, useNavigate } from 'react-router-dom';

interface IProps  {
  spins: ISpin[];
  currentCampaign?: ISpinCampaign;
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: ISpin[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeSpins: (doc: { spinIds: string[] }, emptyBulk: () => void) => void;
  queryParams: any;
}

const SpinsList =(props:IProps) => {
  let timer;
const [searchValue, setSearchValue ] = useState(props.searchValue)
const navigate = useNavigate()
const location = useLocation()

const onChange = () => {
    const { toggleAll, spins } = props;
    toggleAll(spins, "spins");
  };

  const search = (e) => {
    if (timer) {
      clearTimeout(timer);
    }

    const searchValue = e.target.value;

    setSearchValue( searchValue );
    timer = setTimeout(() => {
      router.removeParams(navigate,location, "page");
      router.setParams(navigate,location, { searchValue });
    }, 500);
  };

  const removeSpins = (spins) => {
    const spinIds: string[] = [];

    spins.forEach((spin) => {
      spinIds.push(spin._id);
    });

    props.removeSpins({ spinIds }, props.emptyBulk);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

    const {
      spins,
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
                <SortHandler sortField={"status"} label={__("Status")} />
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="spins">
            {spins.map((spin) => (
              <SpinRow
                spin={spin}
                isChecked={bulk.includes(spin)}
                key={spin._id}
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
        Add spin
      </Button>
    );

    const spinForm = (props) => {
      return <SpinForm {...props} queryParams={queryParams} />;
    };

    const actionBarRight = () => {
      if (bulk.length > 0) {
        const onClick = () =>
          confirm()
            .then(() => {
              removeSpins(bulk);
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
            title="New spin"
            trigger={addTrigger}
            autoOpenKey="showSpinModal"
            content={spinForm}
            backDrop="static"
          />
        </BarItems>
      );
    };

    const actionBarLeft = (
      <Title>
        {(currentCampaign && `${currentCampaign.title}`) ||
          "All spin campaigns"}{" "}
      </Title>
    );
    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight()} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Spins`) + ` (${totalCount})`}
            submenu={menuLoyalties}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        leftSidebar={
          <Sidebar
            loadingMainQuery={loading}
            queryParams={queryParams}
          />
        }
        content={
          <>
            <Count>
              {totalCount} spin{totalCount > 1 && "s"}
            </Count>
            <DataWithLoader
              data={mainContent}
              loading={loading}
              count={spins.length}
              emptyText="Add in your first spin!"
              emptyImage="/images/actions/1.svg"
            />
          </>
        }
        hasBorder
      />
    );
  
}

export default SpinsList;
