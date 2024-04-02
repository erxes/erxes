import * as _loadash from "lodash";

import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import { DetailPopOver } from "../common/utils";
import FormControl from "@erxes/ui/src/components/form/Control";
import HeaderDescription from "@erxes/ui/src/components/HeaderDescription";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import React from "react";
import Row from "./Row";
import { SideBar } from "./SideBar";
import { Statistics } from "../containers/Statistic";
import Table from "@erxes/ui/src/components/table";
import { TableHead } from "./ListHead";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "@erxes/ui/src/utils/core";
import { headers } from "../common/Headers";

type Props = {
  list: any[];
  totalCount: number;
  queryParams: any;
  remove: (ids: string[]) => void;
};

type State = {
  selectedAssessmentIds: string[];
};

class List extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedAssessmentIds: [],
    };
  }

  renderContent = () => {
    const { list, queryParams } = this.props;
    const { selectedAssessmentIds } = this.state;

    const handleSelect = (id: string) => {
      if (selectedAssessmentIds.includes(id)) {
        return this.setState({
          selectedAssessmentIds: selectedAssessmentIds.filter(
            (selectedId) => selectedId !== id
          ),
        });
      }

      this.setState({ selectedAssessmentIds: [...selectedAssessmentIds, id] });
    };

    const handleSelectAll = () => {
      if (!selectedAssessmentIds.length) {
        this.setState({
          selectedAssessmentIds: list.map((assessment) => assessment._id),
        });
      } else {
        this.setState({ selectedAssessmentIds: [] });
      }
    };

    return (
      <Table>
        <thead>
          <tr>
            <th>
              <FormControl
                componentclass="checkbox"
                checked={_loadash.isEqual(
                  selectedAssessmentIds,
                  list.map((assessment) => assessment._id)
                )}
                onChange={handleSelectAll}
              />
            </th>
            <th>{__("Card type")}</th>
            <th>{__("Card Name")}</th>
            {headers(queryParams).map((header) => (
              <TableHead
                key={header.name}
                filter={header.filter}
                sort={header.sort}
              >
                {header.label}
              </TableHead>
            ))}
            <th>{__("Action")}</th>
          </tr>
        </thead>
        <tbody>
          {(list || []).map((item) => (
            <Row
              item={item}
              key={item._id}
              selecteAssessmentIds={selectedAssessmentIds}
              handleSelect={handleSelect}
              queryParams={queryParams}
            />
          ))}
        </tbody>
      </Table>
    );
  };

  render() {
    const { totalCount, queryParams, remove } = this.props;
    const { selectedAssessmentIds } = this.state;

    const leftActionBar = (
      <HeaderDescription
        title="Assessments"
        icon="/images/actions/13.svg"
        description=""
      />
    );

    const removeAssessments = () => {
      remove(selectedAssessmentIds);
      this.setState({ selectedAssessmentIds: [] });
    };

    const rightActionBar = (
      <BarItems>
        <DetailPopOver
          customComponent={
            <Button icon="chart-bar" btnStyle="simple">
              {__("See Statistic")}
            </Button>
          }
          title=""
          placement="left"
        >
          <Statistics totalCount={totalCount} queryParams={queryParams} />
        </DetailPopOver>
        {!!selectedAssessmentIds.length && (
          <Button btnStyle="danger" onClick={removeAssessments}>
            {`Remove (${selectedAssessmentIds?.length || 0})`}
          </Button>
        )}
      </BarItems>
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={"Assessment"} />}
        actionBar={
          <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />
        }
        leftSidebar={<SideBar queryParams={queryParams} />}
        content={this.renderContent()}
        footer={<Pagination count={totalCount} />}
      />
    );
  }
}

export default List;
