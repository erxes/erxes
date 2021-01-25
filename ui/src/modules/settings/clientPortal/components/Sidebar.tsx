import Button from 'erxes-ui/lib/components/Button';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { SidebarList } from 'modules/layout/styles';
import React, { useState } from 'react';
import { CONFIG_TYPES } from '../constants';

type Props = {
  selectedConfig: string;
  handleConfigType: (type: string) => void;
};

const { Title } = Sidebar.Section;

function ClientPortalSidebar({ selectedConfig, handleConfigType }: Props) {
  const [selected, setSelected] = useState<string>(selectedConfig);

  function renderButton(label: string, name: string) {
    const handleClick = () => {
      setSelected(name);
      handleConfigType(name);
    };

    return (
      <li>
        <Button
          btnStyle={selected === name ? 'simple' : 'link'}
          onClick={handleClick}
        >
          {__(label)}
        </Button>
      </li>
    );
  }

  return (
    <Sidebar>
      <Sidebar.Section>
        <Title>{__('Configs')}</Title>
        <SidebarList id={'ClientPortalConfigsSidebar'}>
          {renderButton('General', CONFIG_TYPES.GENERAL)}
          {renderButton('Advanced Settings', CONFIG_TYPES.ADVANCED)}
          {renderButton('Custom Domain', CONFIG_TYPES.CUSTOM_DOMAIN)}
          {renderButton('Color and Fonts', CONFIG_TYPES.COLOR_FONTS)}
          {renderButton('Stylesheet', CONFIG_TYPES.STYLE_SHEET)}
        </SidebarList>
      </Sidebar.Section>
    </Sidebar>
  );
}

export default ClientPortalSidebar;
