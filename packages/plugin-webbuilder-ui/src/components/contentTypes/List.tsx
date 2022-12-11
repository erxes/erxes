import 'grapesjs/dist/css/grapes.min.css';

import { ContentTypeItem } from './styles';
import { FlexCenter } from '@erxes/ui/src/styles/main';
import { IContentTypeDoc } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import { List } from '../pages/styles';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  contentTypes: IContentTypeDoc[];
  contentTypesCount: number;
  siteId?: string;
  handleItemSettings: (item: any, type: string) => void;
};

class ContentTypesList extends React.Component<Props> {
  render() {
    const { contentTypes = [], handleItemSettings, siteId } = this.props;
    console.log(contentTypes);
    return (
      <List>
        {contentTypes.map(type => (
          <li key={type._id}>
            <a>
              <FlexCenter>
                <Icon icon="layers" />
                <ContentTypeItem>
                  {type.displayName}
                  <i>
                    ({type.entries.length || 0} {__('items')})
                  </i>
                </ContentTypeItem>
              </FlexCenter>
            </a>
            <Icon
              icon="settings"
              onClick={() => handleItemSettings(type, 'contenttype')}
            />
          </li>
        ))}
        <li
          onClick={() => handleItemSettings({ displayName: '' }, 'contenttype')}
        >
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
