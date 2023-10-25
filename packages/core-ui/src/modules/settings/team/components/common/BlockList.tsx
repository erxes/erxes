import * as routerUtils from '@erxes/ui/src/utils/router';

import BlockForm from '../../containers/common/BlockForm';
import Box from 'modules/common/components/Box';
import Button from 'modules/common/components/Button';
import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { useHistory } from 'react-router-dom';

type Props = {
  allDatas: any[];
  title: string;
  removeItem: (_id: string) => void;
  queryParams: string;
  queryType: string;
  listQuery: any;
};

export default function BlockList(props: Props) {
  const { allDatas, title, queryParams, queryType, removeItem } = props;
  const history = useHistory();

  const renderRemoveAction = item => {
    return (
      <Button btnStyle="link" onClick={() => removeItem(item._id)}>
        <Tip text={'Remove'} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  const renderForm = ({
    closeModal,
    item
  }: {
    closeModal: () => void;
    item?: any;
  }): React.ReactNode => {
    return (
      <BlockForm item={item} closeModal={closeModal} queryType={queryType} />
    );
  };

  const renderEditAction = item => (
    <ModalTrigger
      content={({ closeModal }) => renderForm({ closeModal, item })}
      title={`Edit ${title}`}
      trigger={editTrigger}
    />
  );

  const renderIcon = () => {
    let icon = 'building';

    switch (queryType) {
      case 'branches':
        icon = 'sitemap-1';
        break;
      case 'departments':
        icon = 'building';
        break;
      case 'units':
        icon = 'users-alt';
        break;
      default:
        break;
    }

    return icon;
  };

  const extreBtnTrigger = (
    <a href="#settings" tabIndex={0}>
      <Icon icon="plus-circle" />
    </a>
  );

  const editTrigger = (
    <Button btnStyle="link">
      <Tip text={'Edit'} placement="bottom">
        <Icon icon="edit" />
      </Tip>
    </Button>
  );

  const extraButtons = (
    <ModalTrigger
      content={({ closeModal }) => renderForm({ closeModal })}
      title={`Add a ${title}`}
      trigger={extreBtnTrigger}
    />
  );

  const linkToText = title.toLocaleLowerCase();

  const onClick = (id: string) => {
    routerUtils.removeParams(history, 'page');
    routerUtils.setParams(history, { [`${linkToText}Id`]: id });
  };

  return (
    <Box
      title={__(title)}
      name={`show${title}`}
      isOpen={true}
      extraButtons={extraButtons}
      collapsible={allDatas.length > 6}
    >
      <SidebarList noTextColor={true} noBackground={true}>
        <CollapsibleList
          items={allDatas}
          onClick={onClick}
          queryParams={queryParams}
          queryParamName={`${linkToText}Id`}
          isTeam={true}
          treeView={true}
          icon={renderIcon()}
          editAction={renderEditAction}
          removeAction={renderRemoveAction}
        />
      </SidebarList>
    </Box>
  );
}
