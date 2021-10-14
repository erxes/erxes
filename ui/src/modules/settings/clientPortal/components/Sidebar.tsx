import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { FieldStyle, SidebarList } from 'modules/layout/styles';
import React, { useState } from 'react';
import { CONFIG_TYPES } from '../constants';

type Props = {
  selectedConfig: string;
  handleConfigType: (type: string) => void;
};

const { Title } = Sidebar.Section;
const { GENERAL, COLOR_FONTS } = CONFIG_TYPES;

function ClientPortalSidebar({ selectedConfig, handleConfigType }: Props) {
  const [selected, setSelected] = useState<string>(selectedConfig);

  function renderButton(label: string, name: string) {
    const handleClick = () => {
      setSelected(name);
      handleConfigType(name);
    };

    return (
      <li>
        <a
          href="#active"
          tabIndex={0}
          className={selected === name ? 'active' : ''}
          onClick={handleClick}
        >
          <FieldStyle>{__(label)}</FieldStyle>
        </a>
      </li>
    );
  }

  return (
    <Sidebar>
      <Sidebar.Section>
        <Title>{__('Configs')}</Title>
        <SidebarList id={'ClientPortalConfigsSidebar'}>
          {renderButton(GENERAL.LABEL, GENERAL.VALUE)}
          {renderButton(COLOR_FONTS.LABEL, COLOR_FONTS.VALUE)}
        </SidebarList>
      </Sidebar.Section>
    </Sidebar>
  );
}

export default ClientPortalSidebar;
