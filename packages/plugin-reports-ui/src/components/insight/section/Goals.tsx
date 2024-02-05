import React, { useRef, useState } from 'react';
import { IGoalType } from '../../../../../plugin-goals-ui/src/types';
import { Box, Button, Icon, SidebarList, Tip, __, router } from '@erxes/ui/src';
import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Dropdown from 'react-bootstrap/Dropdown';
import RTG from 'react-transition-group';
import { RightDrawerContainer } from '../../../styles';
import Form from '../../../containers/insight/goal/Form';

type Props = {
  goals: IGoalType[];
  queryParams: any;
  history: any;
  removeGoalTypes: (goalIds: string[]) => void;
};

const Goals = (props: Props) => {
  const { goals, queryParams, history, removeGoalTypes } = props;

  const [showDrawer, setShowDrawer] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<IGoalType | undefined>(
    undefined,
  );

  const wrapperRef = useRef<any>(null);

  const extraButtons = (
    <Dropdown>
      <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
        <Icon icon="ellipsis-h" size={16} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <li>
          <a
            href="#addGoal"
            onClick={() => {
              setCurrentGoal(undefined);
              setShowDrawer(!showDrawer);
            }}
          >
            {__('Add')}
          </a>
        </li>
        <li>
          <a href="#delete" onClick={() => {}}>
            {__('Delete')}
          </a>
        </li>
      </Dropdown.Menu>
    </Dropdown>
  );

  const renderEditAction = (goal: IGoalType) => {
    return (
      <Button
        btnStyle="link"
        onClick={() => {
          setCurrentGoal(goal);
          setShowDrawer(!showDrawer);
        }}
      >
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );
  };

  const renderRemoveAction = (goal: IGoalType) => {
    return (
      <Button btnStyle="link" onClick={() => removeGoalTypes([goal._id])}>
        <Tip text={__('Remove')} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  const handleClick = (goalId) => {
    router.removeParams(history, ...Object.keys(queryParams));
    router.setParams(history, { goalId });
  };

  const renderContent = () => {
    const goalsWithTitles = goals.map((goal) => {
      const title = `${goal.goalTypeChoose} ${goal.entity}`;
      return { ...goal, title };
    });

    return (
      <SidebarList>
        <CollapsibleList
          items={goalsWithTitles}
          queryParamName="goalId"
          queryParams={queryParams}
          icon="chart-pie"
          treeView={false}
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
        title="Goals"
        name="goals"
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
              goal={currentGoal}
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

export default Goals;
