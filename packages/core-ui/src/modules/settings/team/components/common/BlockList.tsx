import React from 'react';

import Box from '@erxes/ui/src/components/Box';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from 'modules/common/utils';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';

type Props = {
  allDatas: any[];
  title: string;
  renderForm: ({ closeModal }: { closeModal: () => void }) => React.ReactNode;
  renderItems: () => React.ReactNode;
};

export default function BlockList(props: Props) {
  const { allDatas, title, renderItems, renderForm } = props;

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

  return (
    <Box
      title={__(title)}
      name={`show${title}`}
      isOpen={true}
      extraButtons={extraButtons}
      collapsible={allDatas.length > 6}
      noShadow={true}
      noMarginBottom={true}
      noBackground
      noSpacing
    >
      <SidebarList noTextColor noBackground className="no-link">
        {renderItems}
      </SidebarList>
    </Box>
  );
}
