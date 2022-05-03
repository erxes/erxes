import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  NavItem,
  NavIcon,
  NavMenuItem,
  MoreItemRecent,
  RoundBox,
} from '../../styles'
import Tip from 'modules/common/components/Tip'
import WithPermission from 'modules/common/components/WithPermission';
import { __ } from 'modules/common/utils'

import { getLink } from './utils';

function NavigationMoreItem(props) {
  const { plugin, navCollapse, isPinnable, isPinned, handleOnClick } = props

  return (
    <WithPermission key={plugin.url} action={plugin.permission}>
      <MoreItemRecent>
        <NavItem isMoreItem={true}>
          <NavMenuItem isMoreItem={true} navCollapse={navCollapse}>
            <NavLink
              to={getLink(plugin.url)}
            >
              <NavIcon className={plugin.icon} />
              <label>{plugin.text}</label>
            </NavLink>
          </NavMenuItem>
          {isPinnable && (
            <Tip
              placement="top"
              text={isPinned ? __("Unpin plugin") : __("Pin plugin")}
            >
              <RoundBox pinned={isPinned} onClick={() => handleOnClick(plugin)}>
                <img src="/images/pin.svg" alt="pin" />
              </RoundBox>
            </Tip>
          )}
        </NavItem>
      </MoreItemRecent>
    </WithPermission>
  )
}

export default NavigationMoreItem