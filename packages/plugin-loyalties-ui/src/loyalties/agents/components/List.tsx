import { __, router } from "@erxes/ui/src/utils";
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
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
import React from "react";
import AgentForm from "../containers/Form";
import AgentRow from "./Row";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { menuLoyalties } from "../../common/constants";
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "./Sidebar";

interface IProps {
  agents: IAgentDocument[];
  loading: boolean;
  number: string;
  totalCount: number;
  queryParams: IQueryParams;
  removeAgent: (_id: string) => void;
  refetch: () => void;
}

const AgentList = (props: IProps) => {
  let timer;
  const [number, setSearchValue] = React.useState(props.number)
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
      router.setParams(navigate, location, { number: searchValue });
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
    totalCount,
    queryParams,
    removeAgent,
    refetch
  } = props;

  const mainContent = (
    <LoyaltiesTableWrapper>
      <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
        <thead>
          <tr>
            <th>{__("Number")}</th>
            <th>{__("Status")}</th>
            <th>{__("Has Return")}</th>
            <th>{__('Product rules')}</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="agents">
          {agents.map((a) => (
            <AgentRow
              agent={a}
              key={a._id}
              queryParams={queryParams}
              removeAgent={removeAgent}
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
    return (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__("Type to search")}
          onChange={search}
          value={number}
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
      <div>{__('Agents')}</div>
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
      footer={<Pagination count={totalCount} perPage={10}/>}
      leftSidebar={<Sidebar queryParams={queryParams} />}
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
