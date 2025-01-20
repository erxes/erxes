import React, { useState } from 'react';

import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import { FlexCenter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/index';
import {
  CollapsibleListWrapper,
  FlexRow,
  ItemText,
  ToggleIcon,
} from '@erxes/ui/src/components/collapsibleList/styles';
import { ActionButtons, ItemCount } from '@erxes/ui-settings/src/styles';

import { IDashboard, IGoalType, IReport, ISection } from '../../types';
import { SectionListItem, Title } from '../../styles';

type Props = {
  queryParamName: string;
  queryParams: any;
  section: ISection;
  list: IReport[] | IDashboard[] | IGoalType[];
  handleClick?: (id: string) => void;
  renderEditAction?: (item: any) => void;
  renderRemoveAction?: (item: any) => void;
  renderAdditionalActions?: (item: any) => void;

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
    renderAdditionalActions,

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
        additionalActions={renderAdditionalActions}
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
              <FlexCenter>
                <Title isOpen={isOpen}>{section.name}</Title>
                {renderIcon(!!section?.list?.length)}
                <ItemCount className="product-count">
                  {section.listCount}
                </ItemCount>
              </FlexCenter>
            </ItemText>

            {renderActions()}
          </SectionListItem>
        </FlexRow>
        {isOpen && <div className="child">{renderListWithSection()}</div>}
      </SidebarList>
    </CollapsibleListWrapper>
  );
};

export default SectionList;
