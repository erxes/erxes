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
import { ILottery } from "../types";
import { ILotteryCampaign } from "../../../configs/lotteryCampaign/types";
import LotteryForm from "../containers/Form";
import LotteryRow from "./Row";
import { LoyaltiesTableWrapper } from "../../common/styles";
import React, {useState} from "react";
import Sidebar from "./Sidebar";
import { Wrapper } from "@erxes/ui/src/layout";
import { menuLoyalties } from "../../common/constants";
import { useLocation, useNavigate } from 'react-router-dom';

interface IProps  {
  lotteries: ILottery[];
  currentCampaign?: ILotteryCampaign;
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: ILottery[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeLotteries: (
    doc: { lotteryIds: string[] },
    emptyBulk: () => void
  ) => void;
  queryParams: any;
}

const  LotteriesList=(props:IProps)=> {
  let timer;
  const [searchValue, setSearchValue] = useState(props.searchValue)
  const location = useLocation();
  const navigate = useNavigate();
  
  const onChange = () => {
    const { toggleAll, lotteries } = props;
    toggleAll(lotteries, "lotteries");
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

  const removeLotteries = (lotteries) => {
    const lotteryIds: string[] = [];

    lotteries.forEach((lottery) => {
      lotteryIds.push(lottery._id);
    });

    props.removeLotteries({ lotteryIds }, props.emptyBulk);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

    const {
      lotteries,
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
                <SortHandler sortField={"number"} label={__("Number")} />
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
          <tbody id="lotteries">
            {lotteries.map((lottery) => (
              <LotteryRow
                lottery={lottery}
                isChecked={bulk.includes(lottery)}
                key={lottery._id}
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
        Add lottery
      </Button>
    );

    const lotteryForm = (props) => {
      return <LotteryForm {...props} queryParams={queryParams} />;
    };

    const actionBarRight = () => {
      if (bulk.length > 0) {
        const onClick = () =>
          confirm()
            .then(() => {
              removeLotteries(bulk);
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
            title="New lottery"
            trigger={addTrigger}
            autoOpenKey="showLotteryModal"
            content={lotteryForm}
            backDrop="static"
          />
        </BarItems>
      );
    };

    const actionBarLeft = (
      <Title>
        {(currentCampaign && `${currentCampaign.title}`) ||
          "All lottery campaigns"}{" "}
      </Title>
    );
    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight()} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Lotteries`) + ` (${totalCount})`}
            submenu={menuLoyalties}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        leftSidebar={
          <Sidebar
            loadingMainQuery={loading}
            queryParams={queryParams}
            isAward={true}
          />
        }
        content={
          <>
            <Count>
              {totalCount} lottery{totalCount > 1 && "s"}
            </Count>
            <DataWithLoader
              data={mainContent}
              loading={loading}
              count={lotteries.length}
              emptyText="Add in your first lottery!"
              emptyImage="/images/actions/1.svg"
            />
          </>
        }
        hasBorder
      />
    );
  
}

export default LotteriesList;
