import 'grapesjs/dist/css/grapes.min.css';

import { IPageDoc } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import { List } from './styles';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  siteId?: string;
  pages: IPageDoc[];
  handleItemSettings: (item: any, type: string) => void;
};

class PageList extends React.Component<Props> {
  render() {
    const { pages, handleItemSettings, siteId = '' } = this.props;

    return (
      <List>
        {pages.map(page => (
          <li key={page._id}>
            <a href={`/webbuilder/sites/edit/${siteId}?pageId=${page._id}`}>
              <Icon icon="file-1" />
              {page.name}
            </a>
            <Icon
              icon="settings"
              onClick={() => handleItemSettings(page, 'page')}
            />
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
