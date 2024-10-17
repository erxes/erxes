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

import AssignmentForm from "../containers/Form";
import AssignmentRow from "./Row";
import { BarItems } from "@erxes/ui/src/layout/styles";
import { IAssignment } from "../types";
import { IAssignmentCampaign } from "../../../configs/assignmentCampaign/types";
import { LoyaltiesTableWrapper } from "../../common/styles";
import React, {useState} from "react";
import Sidebar from "./Sidebar";
import { Wrapper } from "@erxes/ui/src/layout";
import { menuLoyalties } from "../../common/constants";
import { useLocation, useNavigate } from 'react-router-dom';

interface IProps {
  assignments: IAssignment[];
  currentCampaign?: IAssignmentCampaign;
  loading: boolean;
  searchValue: string;
  totalCount: number;
  toggleBulk: () => void;
  toggleAll: (targets: IAssignment[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeAssignments: (
    doc: { assignmentIds: string[] },
    emptyBulk: () => void
  ) => void;
  queryParams: any;
}

type State = {
  searchValue?: string;
};

const AssignmentsList =(props:IProps) => {
  let timer;
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState(props.searchValue)

  const onChange = () => {
    const { toggleAll, assignments } = props;
    toggleAll(assignments, "assignments");
  };

  const search = (e) => {
    if (timer) {
      clearTimeout(timer);
    }

    const searchValue = e.target.value;

    setSearchValue(searchValue );
    timer = setTimeout(() => {
      router.removeParams(navigate,location, "page");
      router.setParams(navigate,location, { searchValue });
    }, 500);
  };

  const removeAssignments = (assignments) => {
    const assignmentIds: string[] = [];

    assignments.forEach((assignment) => {
      assignmentIds.push(assignment._id);
    });

    props.removeAssignments({ assignmentIds }, props.emptyBulk);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

    const {
      assignments,
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
                <SortHandler sortField={"ownerId"} label={__("Owner")} />
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="assignments">
            {assignments.map((assignment) => (
              <AssignmentRow
                assignment={assignment}
                isChecked={bulk.includes(assignment)}
                key={assignment._id}
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
        Add assignment
      </Button>
    );

    const assignmentForm = (props) => {
      return (
        <AssignmentForm
          {...props}
          queryParams={queryParams}
        />
      );
    };

    const actionBarRight = () => {
      if (bulk.length > 0) {
        const onClick = () =>
          confirm()
            .then(() => {
              removeAssignments(bulk);
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
            title={__("New assignment")}
            trigger={addTrigger}
            autoOpenKey="showAssignmentModal"
            content={assignmentForm}
            backDrop="static"
          />
        </BarItems>
      );
    };

    const actionBarLeft = (
      <Title>
        {(currentCampaign && `${currentCampaign.title}`) ||
          "All assignment campaigns"}{" "}
      </Title>
    );
    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight()} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Assignments`) + ` (${totalCount})`}
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
              {totalCount} assignment{totalCount > 1 && "s"}
            </Count>
            <DataWithLoader
              data={mainContent}
              loading={loading}
              count={assignments.length}
              emptyText="Add in your first assignment!"
              emptyImage="/images/actions/1.svg"
            />
          </>
        }
        hasBorder
      />
    );
  
}

export default AssignmentsList;
