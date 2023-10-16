import React from 'react';

import Box from '@erxes/ui/src/components/Box';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from 'modules/common/utils';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';
import queryString from 'query-string';

type Props = {
  allDatas: any[];
  title: string;
  renderForm: ({ closeModal }: { closeModal: () => void }) => React.ReactNode;
  renderEditAction?;
  renderRemoveAction?;
};

export default function BlockList(props: Props) {
  const {
    allDatas,
    title,
    renderForm,
    renderEditAction,
    renderRemoveAction
  } = props;

  const trigger = (
    <a href="#settings" tabIndex={0}>
      <Icon icon="plus-circle" />
    </a>
  );

  const extraButtons = (
    <ModalTrigger
      content={({ closeModal }) => renderForm({ closeModal })}
      title={`Add a ${title}`}
      trigger={trigger}
    />
  );

  const queryParams = queryString.parse(location.search);
  const linkToText = title.toLowerCase();

  const renderContent = (
    <CollapsibleList
      items={allDatas}
      linkToText={`?${linkToText}Id=`}
      queryParams={queryParams}
      queryParamName={`${linkToText}Id`}
      isTeam={true}
      treeView={true}
      editAction={renderEditAction}
      removeAction={renderRemoveAction}
    />
  );

  return (
    <Box
      title={__(title)}
      name={`show${title}`}
      isOpen={true}
      extraButtons={extraButtons}
      collapsible={allDatas.length > 6}
    >
      <SidebarList noTextColor noBackground>
        {renderContent}
      </SidebarList>
    </Box>
  );
}
