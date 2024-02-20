import React, { useRef, useState } from 'react';
import { Box, Button, Icon, SidebarList, Tip, __, router } from '@erxes/ui/src';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Dropdown from 'react-bootstrap/Dropdown';
import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';
import FormContainer from '../../containers/goal/Form';
import { capitalize } from 'lodash';
import { RightDrawerContainer } from '../../styles';
import RTG from 'react-transition-group';
import { IGoalType, ISection } from '../../types';

type Props = {
  history: any;
  queryParams: any;

  goals: IGoalType[];
  sections: ISection[];

  removeGoalTypes: (goalIds: string[]) => void;
};

const GoalSection = (props: Props) => {
  const { goals, sections, queryParams, history, removeGoalTypes } = props;

  const wrapperRef = useRef<any>(null);

  const [showDrawer, setShowDrawer] = useState<any>(false);
  const [currentGoal, setCurrentGoal] = useState<any>({} as any);

  const closeDrawer = () => {
    setShowDrawer(false);
    setCurrentGoal({});
  };

  const extraButtons = (
    <Dropdown drop="down" alignRight={true}>
      <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
        <Icon icon="ellipsis-h" size={16} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <li>
          <a
            href="#addGoal"
            onClick={() => {
              setCurrentGoal({} as any);
              setShowDrawer(!showDrawer);
            }}
          >
            <Icon icon="plus-1" />

            {__('Goal')}
          </a>
        </li>
      </Dropdown.Menu>
    </Dropdown>
  );

  const renderEditAction = (goal: any) => {
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

  const renderRemoveAction = (goal: any) => {
    return (
      <Button btnStyle="link" onClick={() => removeGoalTypes([goal._id])}>
        <Tip text={__('Remove')} placement="bottom">
          <Icon icon="times-circle" />
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
      const title = `${capitalize(goal.entity)} ${goal.goalTypeChoose}`;
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
        title="Goal"
        name="goal"
        isOpen={!!queryParams.goalId}
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
            {
              <FormContainer
                queryParams={queryParams}
                history={history}
                goalId={currentGoal._id}
                closeDrawer={closeDrawer}
              />
            }
          </RightDrawerContainer>
        </RTG.CSSTransition>
      </div>
    </>
  );
};

export default GoalSection;
