import Box from '@erxes/ui/src/components/Box';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import { __ } from 'modules/common/utils';
import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';
import { Icon } from '@erxes/ui/src/components';

type Props = {
  allDatas: any[];
  title: string;
  renderForm: ({
    closeModal,
    item
  }: {
    closeModal: () => void;
    item?: string;
  }) => React.ReactNode;
  queryParams: string;
  queryType: string;
  removeAction?;
  editAction?;
};

export default function BlockList(props: Props) {
  const {
    allDatas,
    title,
    renderForm,
    queryParams,
    removeAction,
    editAction
  } = props;

  const trigger = (
    <a href="#settings" tabIndex={0}>
      <Icon icon="plus-circle" />
    </a>
  );

  const linkToText = title.toLocaleLowerCase();

  const renderItem = (
    <CollapsibleList
      items={allDatas}
      linkToText={`?${linkToText}Id=`}
      queryParams={queryParams}
      queryParamName={`${linkToText}Id`}
      isTeam={true}
      treeView={true}
      editAction={editAction}
      removeAction={removeAction}
    />
  );

  const extraButtons = (
    <ModalTrigger
      content={({ closeModal }) => renderForm({ closeModal })}
      title={`Add a ${title}`}
      trigger={trigger}
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
      <SidebarList noTextColor={true} noBackground={true}>
        {renderItem}
      </SidebarList>
    </Box>
  );
}
