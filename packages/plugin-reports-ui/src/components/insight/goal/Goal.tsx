import React from 'react';
import { IGoalType } from '../../../../../plugin-goals-ui/src/types';
import { Title } from '@erxes/ui-settings/src/styles';
import { BarItems, Button, Table, Wrapper, __ } from '@erxes/ui/src';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Dropdown from 'react-bootstrap/Dropdown';
import { DragField } from '../../../styles';
import List from '../List';
import dayjs from 'dayjs';
import Detail from '../../../containers/insight/goal/Detail';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';

type Props = {
  queryParams: any;
  history: any;
  goal: IGoalType;
  loading: boolean;
};

const Goal = (props: Props) => {
  const { goal, queryParams, history, loading } = props;

  const renderActionBar = () => {
    const leftActionBar = <Title>{__(`${goal.entity || 'Goal'}`)}</Title>;

    const rightActionBar = (
      <BarItems>
        <Button>Add to dashboard</Button>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
            <Button icon="ellipsis-h" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li>
              <a href="#duplicate" onClick={() => {}}>
                {__('Duplicate')}
              </a>
            </li>
            <li>
              <a href="#delete" onClick={() => {}}>
                {__('Delete')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </BarItems>
    );

    return <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />;
  };

  const onLayoutChange = (layout) => {
    console.log(layout);
  };

  const renderContent = () => {
    return (
      <>
        <DataWithLoader
          data={<Detail goal={goal} />}
          loading={loading}
          emptyText={__('No data for this goal')}
          emptyImage="/images/actions/11.svg"
        />
        <DragField
          haveChart={true}
          cols={2 * 3}
          margin={[30, 30]}
          // onDragStart={() => setIsDragging(true)}
          // onDragEnd={() => setIsDragging(false)}
          // onResizeStart={() => setIsDragging(true)}
          // onResizeStop={() => setIsDragging(false)}
          onLayoutChange={onLayoutChange}
          // isDragging={isDragging}
          rowHeight={160}
          containerPadding={[30, 30]}
          useCSSTransforms={true}
        >
          <div
            key="a"
            data-grid={{
              x: 0,
              y: 0,
              w: 6,
              h: 1,
              static: true,
            }}
          >
            a
          </div>

          <div key="b" data-grid={{ x: 1, y: 0, w: 3, h: 2 }}>
            b
          </div>
          <div key="c" data-grid={{ x: 2, y: 0, w: 1, h: 2 }}>
            c
          </div>
        </DragField>
      </>
    );
  };

  return (
    <>
      {renderActionBar()}
      {renderContent()}
    </>
  );
};

export default Goal;
