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
};

class ContentTypesList extends React.Component<Props> {
  render() {
    const { contentTypes = [] } = this.props;

    return (
      <List>
        {contentTypes.map(type => (
          <li key={type._id}>
            <div>
              <Icon icon="file-1" />
              {type.displayName}
            </div>
            <Icon icon="settings" />
          </li>
        ))}
        <li>
          <div className="link">
            <Icon icon="plus-1" />
            {__('Create content type')}
          </div>
        </li>
      </List>
    );
  }
}

export default ContentTypesList;
