import React, { useRef, useState } from "react";

import Dropdown from "@erxes/ui/src/components/Dropdown";
import RTG from "react-transition-group";
import { capitalize } from "lodash";

import CollapsibleList from "@erxes/ui/src/components/collapsibleList/CollapsibleList";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import Tip from "@erxes/ui/src/components/Tip";
import Button from "@erxes/ui/src/components/Button";
import Box from "@erxes/ui/src/components/Box";
import Icon from "@erxes/ui/src/components/Icon";
import { SidebarList } from "@erxes/ui/src/layout/styles";
import { __ } from "@erxes/ui/src/utils/index";
import { router } from "@erxes/ui/src/utils";

import FormContainer from "../../containers/goal/Form";
import { RightDrawerContainer } from "../../styles";
import { IGoalType, ISection } from "../../types";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;

  goals: IGoalType[];
  sections: ISection[];

  removeGoalTypes: (goalIds: string[]) => void;
};

const GoalSection = (props: Props) => {
  const { goals, sections, queryParams, removeGoalTypes } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const wrapperRef = useRef<any>(null);

  const [showDrawer, setShowDrawer] = useState<any>(false);
  const [currentGoal, setCurrentGoal] = useState<any>({} as any);

  const closeDrawer = () => {
    setShowDrawer(false);
    setCurrentGoal({});
  };

  const extraButtons = (
    <Dropdown
      drop="down"
      as={DropdownToggle}
      toggleComponent={<Icon icon="ellipsis-h" size={16} />}
      // alignRight={true}
    >
      <li>
        <a
          href="#addGoal"
          onClick={() => {
            setCurrentGoal({} as any);
            setShowDrawer(!showDrawer);
          }}
        >
          <Icon icon="plus-1" />

          {__("Goal")}
        </a>
      </li>
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
        <Tip text={__("Edit")} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );
  };

  const renderRemoveAction = (goal: any) => {
    return (
      <Button btnStyle="link" onClick={() => removeGoalTypes([goal._id])}>
        <Tip text={__("Remove")} placement="bottom">
          <Icon icon="times-circle" />
        </Tip>
      </Button>
    );
  };

  const handleClick = (goalId) => {
    router.removeParams(navigate, location, ...Object.keys(queryParams));
    router.setParams(navigate, location, { goalId });
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
