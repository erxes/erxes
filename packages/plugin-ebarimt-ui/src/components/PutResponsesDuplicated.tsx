import { BarItems, Wrapper } from "@erxes/ui/src/layout";
import {
  DataWithLoader,
  ModalTrigger,
  Pagination,
  Table,
} from "@erxes/ui/src/components";
import { IQueryParams } from "@erxes/ui/src/types";

import DetailDuplicated from "../containers/DetailDuplicated";
import { IPutResponse } from "../types";
import React from "react";
import RightMenu from "./RightMenuDuplicated";
import { SUB_MENUS } from "../constants";
import { TableWrapper } from "../styles";
import { __ } from "@erxes/ui/src/utils";

interface IProps {
  errorMsg: string;
  putResponsesDuplicated: IPutResponse[];
  loading: boolean;
  totalCount: number;
  sumAmount?: number;
  queryParams: any;

  onFilter: (filterParams: IQueryParams) => void;
  isFiltered: boolean;
  clearFilter: () => void;
}

class PutResponsesDuplicated extends React.Component<IProps> {
  renderRow(putResponse, index) {
    const { _id, date, number, count } = putResponse;

    const modalContent = (_props) => {
      return (
        <DetailDuplicated contentId={_id.contentId} taxType={_id.taxType} />
      );
    };

    const trigger = (
      <tr>
        <td>{index + 1} </td>
        <td>{date} </td>
        <td>{number} </td>
        <td>{count.toLocaleString()} </td>
      </tr>
    );

    return (
      <ModalTrigger
        key={`${_id.contentId}${_id.taxType}}`}
        title={`Order detail`}
        trigger={trigger}
        autoOpenKey="showProductModal"
        paddingContent="less-padding"
        content={modalContent}
        size={"xl"}
      />
    );
  }

  render() {
    const {
      putResponsesDuplicated,
      loading,
      totalCount,
      sumAmount,
      queryParams,
      errorMsg,
      onFilter,
      isFiltered,
      clearFilter,
    } = this.props;

    const mainContent = (
      <TableWrapper>
        <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
          <thead>
            <tr>
              <th>{__("№")}</th>
              <th>{__("Date")}</th>
              <th>{__("Number")}</th>
              <th>{__("Count")}</th>
            </tr>
          </thead>
          <tbody id="putResponses">
            {(putResponsesDuplicated || []).map((putResponse, index) =>
              this.renderRow(putResponse, index)
            )}
          </tbody>
        </Table>
      </TableWrapper>
    );

    const rightMenuProps = {
      onFilter,
      isFiltered,
      clearFilter,
      queryParams,
      showMenu: !!errorMsg,
    };

    const actionBarRight = (
      <BarItems>
        <RightMenu {...rightMenuProps} />
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar
        right={actionBarRight}
        left={`Total: ${totalCount} #SumAmount: ${(
          sumAmount || 0
        ).toLocaleString()}`}
      />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Put Response`)}
            queryParams={queryParams}
            submenu={SUB_MENUS}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={totalCount}
            emptyText={
              errorMsg?.replace("GraphQL error: ", "") ||
              "not found duplicated putResponse!"
            }
            emptyImage="/images/actions/1.svg"
          />
        }
      />
    );
  }
}

export default PutResponsesDuplicated;
