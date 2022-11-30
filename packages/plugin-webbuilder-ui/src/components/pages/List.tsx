import 'grapesjs/dist/css/grapes.min.css';

import { IPageDoc } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import { List } from './styles';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  pages: IPageDoc[];
};

class PageList extends React.Component<Props> {
  render() {
    const { pages } = this.props;

    return (
      <List>
        {pages.map(page => (
          <li key={page._id}>
            <div>
              <Icon icon="file-1" />
              {page.name}
            </div>
            <Icon icon="settings" />
          </li>
        ))}
        <li>
          <div className="link">
            <Icon icon="plus-1" />
            {__('Create page')}
          </div>
        </li>
      </List>
    );
  }
}

export default PageList;
