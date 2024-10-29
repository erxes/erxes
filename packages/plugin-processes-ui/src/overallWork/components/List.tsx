import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import { IOverallWork } from "../types";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import React from "react";
import Row from "./Row";
import Sidebar from "./Sidebar";
import Table from "@erxes/ui/src/components/table";
import { TableWrapper } from "../../styles";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "coreui/utils";
import { menuNavs } from "../../constants";

interface IProps {
  overallWorks: IOverallWork[];
  totalCount: number;
  queryParams: any;
}

class OverallWorks extends React.Component<IProps, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    const { overallWorks, totalCount, queryParams } = this.props;

    const mainContent = (
      <TableWrapper>
        <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
          <thead>
            <tr>
              <th>{__("Type")}</th>
              <th>{__("Job")}</th>
              <th>{__("Product")}</th>
              <th>{__("Count")}</th>
              <th>{__("Spend Branch")}</th>
              <th>{__("Spend Department")}</th>
              <th>{__("Receipt Branch")}</th>
              <th>{__("Receipt Department")}</th>
              <th>{__("Actions")}</th>
            </tr>
          </thead>
          <tbody id="overallWorks">
            {(overallWorks || []).map((work) => (
              <Row key={Math.random()} work={work} queryParams={queryParams} />
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    );

    return (
      <Wrapper
        hasBorder={true}
        header={
          <Wrapper.Header title={__(`Overall works`)} submenu={menuNavs} />
        }
        leftSidebar={<Sidebar queryParams={queryParams} />}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={false}
            count={totalCount}
            emptyText={__("Add in your first work!")}
            emptyImage="/images/actions/1.svg"
          />
        }
      />
    );
  }
}

export default OverallWorks;
