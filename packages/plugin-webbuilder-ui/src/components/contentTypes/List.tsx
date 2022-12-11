import 'grapesjs/dist/css/grapes.min.css';

import { IContentTypeDoc } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import { List } from '../pages/styles';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  contentTypes: IContentTypeDoc[];
  remove: (contentTypeId: string) => void;
  contentTypesCount: number;
  siteId?: string;
  handleItemSettings: (item: any, type: string) => void;
};

class ContentTypesList extends React.Component<Props> {
  render() {
    const { contentTypes = [], handleItemSettings, siteId } = this.props;

    return (
      <List>
        {contentTypes.map(type => (
          <li key={type._id}>
            <a>
              <Icon icon="layers" />
              {type.displayName}
            </a>
            <Icon
              icon="settings"
              onClick={() => handleItemSettings(type, 'contenttype')}
            />
          </li>
        ))}
        <li>
          <div className="link">
            <Icon icon="plus-1" /> &nbsp;
            {__('Create content type')}
          </div>
        </li>
      </List>
    );
  }
}

export default ContentTypesList;
