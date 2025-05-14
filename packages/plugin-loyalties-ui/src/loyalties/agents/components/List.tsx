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
import { IQueryParams } from "@erxes/ui/src/types";

import { BarItems } from "@erxes/ui/src/layout/styles";
import { IAgentDocument } from "../types";
import { LoyaltiesTableWrapper } from "../../common/styles";
import React, { useState } from "react";
import AgentForm from "../containers/Form";
import AgentRow from "./Row";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { menuLoyalties } from "../../common/constants";
import { useLocation, useNavigate } from 'react-router-dom';

interface IProps {
  agents: IAgentDocument[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  toggleBulk: () => void;
  toggleAll: (targets: IAgentDocument[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  queryParams: IQueryParams;
}

const AgentList = (props: IProps) => {
  let timer;
  const [searchValue, setSearchValue] = useState(props.searchValue)
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

  const {
    agents,
    loading,
    toggleBulk,
    bulk,
    totalCount,
    queryParams,
  } = props;

  const mainContent = (
    <LoyaltiesTableWrapper>
      <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
        <thead>
          <tr>
            <th>
              <SortHandler sortField={"number"} label={__("Number")} />
            </th>
            <th>
              <SortHandler sortField={"status"} label={__("Status")} />
            </th>
            <th>
              <SortHandler sortField={"hasReturn"} label={__("Has Return")} />
            </th>
            <th>{__('Product rules')}</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="agents">
          {agents.map((a) => (
            <AgentRow
              agent={a}
              isChecked={bulk.includes(a)}
              key={a._id}
              toggleBulk={toggleBulk}
              queryParams={queryParams}
            />
          ))}
        </tbody>
      </Table>
    </LoyaltiesTableWrapper>
  );

  const addTrigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add agent
    </Button>
  );

  const agentForm = (props) => {
    return <AgentForm {...props} queryParams={queryParams} />;
  };

  const actionBarRight = () => {
    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            // removeVouchers(bulk);
            console.log('removing')
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
          title={__("New agent")}
          trigger={addTrigger}
          autoOpenKey="showAgentModal"
          content={agentForm}
          backDrop="static"
          size="lg"
        />
      </BarItems>
    );
  };

  const actionBarLeft = (
    <Title>
      <div>Agents</div>
    </Title>
  );

  const actionBar = (
    <Wrapper.ActionBar right={actionBarRight()} left={actionBarLeft} />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Agents`) + ` (${totalCount})`}
          submenu={menuLoyalties}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      leftSidebar={
        <div />
      }
      content={
        <>
          <Count>
            {totalCount} agent{totalCount > 1 && "s"}
          </Count>
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={agents.length}
            emptyText="Add in your first agent!"
            emptyImage="/images/actions/1.svg"
          />
        </>
      }
      hasBorder
    />
  );

}

export default AgentList;
