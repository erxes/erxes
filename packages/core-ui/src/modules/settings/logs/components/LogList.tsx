import * as React from "react";

import { Title } from "@erxes/ui-settings/src/styles";
import { __, router } from "@erxes/ui/src/utils";

import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import FormControl from "@erxes/ui/src/components/form/Control";
import { ILog } from "../types";
import LogRow from "./LogRow";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Sidebar from "./Sidebar";
import Table from "@erxes/ui/src/components/table";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: Record<string, string>;
  isLoading: boolean;
  errorMessage: string;
} & commonProps;

type commonProps = {
  logs: ILog[];
  count: number;
  refetchQueries: any;
};

const breadcrumb = [
  { title: "Settings", link: "/settings" },
  { title: __("Logs") },
];

const LogList = (props: Props) => {
  let timer;
  const location = useLocation();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = React.useState(
    props.queryParams.searchValue || ""
  );

  const searchHandler = (e) => {
    if (timer) {
      clearTimeout(timer);
    }

    const inputValue = e.target.value;
    setSearchValue(inputValue);

    timer = setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue: inputValue });
    }, 500);
  };

  const renderObjects = () => {
    const { logs } = props;
    const rows: JSX.Element[] = [];

    if (!logs) {
      return rows;
    }

    for (const log of logs) {
      rows.push(<LogRow key={log._id} log={log} />);
    }

    return rows;
  };

  const renderContent = () => {
    return (
      <Table
        $whiteSpace="wrap"
        $hover={true}
        $bordered={true}
        $condensed={true}
      >
        <thead>
          <tr>
            <th>{__("Date")}</th>
            <th>{__("Created by")}</th>
            <th>{__("Module")}</th>
            <th>{__("Action")}</th>
            <th>{__("Description")}</th>
            <th>{__("Changes")}</th>
          </tr>
        </thead>
        <tbody>{renderObjects()}</tbody>
      </Table>
    );
  };

  const actionBarRight = () => {
    return (
      <FormControl
        type="text"
        placeholder={__("Type to search")}
        onChange={searchHandler}
        autoFocus={true}
        value={searchValue}
      />
    );
  };

  const { isLoading, count, errorMessage, queryParams } = props;

  if (errorMessage.indexOf("Permission required") !== -1) {
    return (
      <EmptyState
        text={__("Permission denied")}
        image="/images/actions/21.svg"
      />
    );
  }

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Logs")}
          breadcrumb={breadcrumb}
          queryParams={queryParams}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__(`Logs (${count})`)}</Title>}
          right={actionBarRight()}
          background="colorWhite"
          wideSpacing={true}
        />
      }
      footer={<Pagination count={count} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={isLoading}
          count={count}
          emptyText={__("There are no logs recorded")}
          emptyImage="/images/actions/21.svg"
        />
      }
      hasBorder={true}
      leftSidebar={<Sidebar queryParams={queryParams} />}
    />
  );
};

export default LogList;
