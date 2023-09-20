import {
  MoreItemRecent,
  NavIcon,
  NavItem,
  NavMenuItem,
  RoundBox
} from '../../styles';

import { NavLink } from 'react-router-dom';
import { Plugin } from './types';
import React from 'react';
import Tip from 'modules/common/components/Tip';
import WithPermission from 'modules/common/components/WithPermission';
import { __ } from 'modules/common/utils';
import { getLink } from './utils';

type Props = {
  plugin: Plugin;
  navCollapse: number;
  isPinnable: boolean;
  isPinned: boolean;
  handleOnClick: (plugin: Plugin) => void;
  toggleMenu: (text: string) => void;
};

export default function NavigationMoreItem(props: Props) {
  const {
    plugin,
    navCollapse,
    isPinnable,
    isPinned,
    handleOnClick,
    toggleMenu
  } = props;

  return (
    <WithPermission
      key={plugin.url}
      action={plugin.permission ? plugin.permission : ''}
      actions={plugin.permissions ? plugin.permissions : []}
    >
      <MoreItemRecent>
        <NavItem isMoreItem={true}>
          <Tip placement="top" text={plugin.text}>
            <NavMenuItem isMoreItem={true} navCollapse={navCollapse}>
              <NavLink
                to={getLink(plugin.url)}
                onClick={() => toggleMenu(plugin.text)}
              >
                <NavIcon className={plugin.icon} />
                <label>{plugin.text}</label>
              </NavLink>
            </NavMenuItem>
          </Tip>
          {isPinnable && (
            <Tip
              placement="top"
              text={isPinned ? __('Unpin plugin') : __('Pin plugin')}
            >
              <RoundBox pinned={isPinned} onClick={() => handleOnClick(plugin)}>
                <img src="/images/pin.svg" alt="pin" />
              </RoundBox>
            </Tip>
          )}
        </NavItem>
      </MoreItemRecent>
    </WithPermission>
  );
}
