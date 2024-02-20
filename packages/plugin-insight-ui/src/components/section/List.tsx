import React, { useState } from 'react';
import {
  CollapsibleListWrapper,
  FlexRow,
  SidebarListItem,
  ItemText,
  ToggleIcon,
} from '@erxes/ui/src/components/collapsibleList/styles';
import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';
import { Button, Icon, SidebarList, Tip, __ } from '@erxes/ui/src';
import {
  ActionButtons,
  FlexBetween,
  ItemCount,
} from '@erxes/ui-settings/src/styles';
import { SectionListItem } from '../../styles';
import { IDashboard, IGoalType, IReport, ISection } from '../../types';

type Props = {
  queryParamName: string;
  queryParams: any;
  section: ISection;
  list: IReport[] | IDashboard[] | IGoalType[];
  handleClick?: (id: string) => void;
  renderEditAction?: (item: any) => void;
  renderRemoveAction?: (item: any) => void;

  removeSection: (id: string) => void;
};

const SectionList = (props: Props) => {
  const {
    section,
    list,
    queryParams,
    queryParamName,
    handleClick,
    renderEditAction,
    renderRemoveAction,

    removeSection,
  } = props;

  const [isOpen, setIsOpen] = useState<boolean>(
    section?.list?.some((item) =>
      Object.keys(queryParams).every((key) => item._id === queryParams[key]),
    ),
  );

  const renderIcon = (hasList) => {
    if (!hasList) {
      return null;
    }

    return (
      <ToggleIcon className="arrow-icon">
        <Icon icon={isOpen ? 'angle-down' : 'angle-right'} size={18} />
      </ToggleIcon>
    );
  };

  const renderListWithSection = () => {
    const items = list.filter((item) => section._id.includes(item.sectionId!));

    if (items.length === 0) {
      return null;
    }

    return (
      <CollapsibleList
        items={items}
        queryParamName={queryParamName}
        queryParams={queryParams}
        keyCount="chartsCount"
        icon="chart-pie"
        treeView={false}
        onClick={handleClick}
        editAction={renderEditAction}
        removeAction={renderRemoveAction}
      />
    );
  };

  const renderActions = () => {
    return (
      <ActionButtons>
        <Button btnStyle="link" onClick={() => removeSection(section._id)}>
          <Tip text={__('Remove')} placement="bottom">
            <Icon icon="times-circle" />
          </Tip>
        </Button>
      </ActionButtons>
    );
  };

  return (
    <CollapsibleListWrapper>
      <SidebarList>
        <FlexRow key={section._id} onClick={() => setIsOpen(!isOpen)}>
          <SectionListItem isActive={false}>
            <Icon className="list-icon" icon="layer-group" />
            <ItemText>
              <FlexBetween>
                {section.name}
                <ItemCount className="product-count">
                  {section.listCount}
                </ItemCount>
              </FlexBetween>
            </ItemText>
            {renderIcon(!!section?.list?.length)}
            {renderActions()}
          </SectionListItem>
        </FlexRow>
        {isOpen && <div className="child">{renderListWithSection()}</div>}
      </SidebarList>
    </CollapsibleListWrapper>
  );
};

export default SectionList;
