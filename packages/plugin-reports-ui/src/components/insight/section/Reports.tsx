import React, { useEffect, useRef, useState } from 'react';
import { IReport } from '../../../types';
import {
  Box,
  Button,
  FlexItem,
  Icon,
  SidebarList,
  Tip,
  __,
} from '@erxes/ui/src';
import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';
import { router } from '@erxes/ui/src/utils/core';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Dropdown from 'react-bootstrap/Dropdown';
import RTG from 'react-transition-group';
import { RightDrawerContainer } from '../../../styles';
import Form from '../../../containers/insight/report/Form';

type Props = {
  reports: IReport[];
  queryParams: any;
  history: any;
  removeReports: (reportIds: string[]) => void;
};

const Reports = (props: Props) => {
  const { reports, queryParams, history, removeReports } = props;

  const wrapperRef = useRef<any>(null);
  const [showDrawer, setShowDrawer] = useState(true);
  const [currentReport, setCurrentReport] = useState<IReport>({} as IReport);

  const extraButtons = (
    <Dropdown>
      <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
        <Icon icon="ellipsis-h" size={16} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <li>
          <a
            href="#addReport"
            onClick={() => {
              setCurrentReport({} as IReport);
              setShowDrawer(!showDrawer);
            }}
          >
            {__('Add')}
          </a>
        </li>
        {/* <li>
          <a href="#addSection" onClick={() => {}}>
            {__('Section')}
          </a>
        </li> */}
        <li>
          <a href="#delete" onClick={() => {}}>
            {__('Delete')}
          </a>
        </li>
      </Dropdown.Menu>
    </Dropdown>
  );

  const renderEditAction = (report: IReport) => {
    return (
      <Button
        btnStyle="link"
        onClick={() => {
          setCurrentReport(report);
          setShowDrawer(!showDrawer);
        }}
      >
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );
  };

  const renderRemoveAction = (report: IReport) => {
    return (
      <Button btnStyle="link" onClick={() => removeReports([report._id])}>
        <Tip text={__('Remove')} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  const handleClick = (reportId) => {
    router.removeParams(history, ...Object.keys(queryParams));
    router.setParams(history, { reportId });
  };

  const renderContent = () => {
    return (
      <SidebarList>
        <CollapsibleList
          items={reports}
          queryParamName="reportId"
          queryParams={queryParams}
          icon="chart-pie"
          treeView={false}
          keyCount="chartsCount"
          onClick={handleClick}
          editAction={renderEditAction}
          removeAction={renderRemoveAction}
        />
      </SidebarList>
    );
  };

  return (
    <>
      <Box
        title="Reports"
        name="reports"
        isOpen={true}
        collapsible={false}
        extraButtons={extraButtons}
      >
        {renderContent()}
      </Box>
      <div ref={wrapperRef}>
        <RTG.CSSTransition
          in={showDrawer}
          timeout={300}
          classNames="slide-in-right"
          unmountOnExit={true}
        >
          <RightDrawerContainer>
            <Form
              reportId={currentReport._id}
              queryParams={queryParams}
              history={history}
              setShowDrawer={setShowDrawer}
            />
          </RightDrawerContainer>
        </RTG.CSSTransition>
      </div>
    </>
  );
};

export default Reports;
