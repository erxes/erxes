import React, { useEffect, useState } from 'react';
import { Title } from '@erxes/ui-settings/src/styles';
import {
  ActionButtons,
  BarItems,
  Button,
  DataWithLoader,
  PageContent,
  Table,
  Wrapper,
  Icon,
  __,
} from '@erxes/ui/src';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';

import {
  ContentContainer,
  DetailBox,
  DetailBoxContainer,
  DragField,
} from '../../styles';

import GridLayout from 'react-grid-layout';
import Sidebar from '../Sidebar';
import DetailContainer from '../../containers/goal/Detail';
import { capitalize } from 'lodash';
import { IGoalType, ISpecificPeriodGoal } from '../../types';

type Props = {
  history: any;
  queryParams: any;
  goal: IGoalType;
  loading: boolean;
};

const Goal = (props: Props) => {
  const { goal, loading, queryParams, history } = props;
  const [specificPeriodGoals, setSpecificPeriodGoals] = useState<
    ISpecificPeriodGoal[]
  >([]);

  useEffect(() => {
    if (goal) {
      setSpecificPeriodGoals(goal.specificPeriodGoals || []);
    }
  }, [goal]);

  const renderActionBar = () => {
    const title =
      `${capitalize(goal.entity) || ''} ${goal.goalTypeChoose}` || '';

    const leftActionBar = <Title>{__(`${title} `)}</Title>;

    const rightActionBar = (
      <BarItems>
        <Button btnStyle="simple">Add to dashboard</Button>
        <Dropdown drop="down" alignRight={true}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
            <Button icon="ellipsis-h" btnStyle="simple" />
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-container">
            <li>
              <a href="#duplicate" onClick={() => {}}>
                <Icon icon="copy" />
                {__('Duplicate')}
              </a>
            </li>
            <li>
              <a href="#delete" onClick={() => {}}>
                <Icon icon="trash-alt" />

                {__('Delete')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </BarItems>
    );

    return <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />;
  };

  const calculateDynamicHeight = () => {
    let height: number = 0.9;
    if (specificPeriodGoals.length !== 0) {
      height += specificPeriodGoals.length * 0.194 + 0.25;
    }
    return height;
  };

  const renderContent = () => (
    <DataWithLoader
      data={
        <DragField
          haveChart={true}
          cols={6}
          margin={[30, 30]}
          isDragging={false}
          rowHeight={160}
          containerPadding={[30, 30]}
          useCSSTransforms={true}
        >
          <div
            key="detail"
            data-grid={{
              x: 0,
              y: 0,
              w: 6,
              h: calculateDynamicHeight(),
              static: true,
            }}
          >
            <DetailContainer goal={goal} />
          </div>
          <div key="chart" data-grid={{ x: 1, y: 0, w: 6, h: 2 }}>
            chart
          </div>
        </DragField>
      }
      loading={loading}
      emptyText={__('No data for this goal')}
      emptyImage="/images/actions/11.svg"
    />
  );

  return (
    <ContentContainer>
      <PageContent actionBar={renderActionBar()} transparent={false}>
        {renderContent()}
      </PageContent>
    </ContentContainer>
  );
};

export default Goal;
