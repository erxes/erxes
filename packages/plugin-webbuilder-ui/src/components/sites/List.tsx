import {
  Content,
  FlexWrap,
  PreviewContent,
  SiteBox,
  SitePreview
} from './styles';

import Button from '@erxes/ui/src/components/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import { ISiteDoc } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { getEnv } from '@erxes/ui/src/utils/core';

type Props = {
  sites: ISiteDoc[];
  getActionBar: (actionBar: any) => void;
  remove: (_id: string) => void;
  setCount: (count: number) => void;
  sitesCount: number;
  queryParams: any;
};

class SiteList extends React.Component<Props, {}> {
  showSite = (site: ISiteDoc) => {
    const { REACT_APP_API_URL } = getEnv();

    const url = `${REACT_APP_API_URL}/pl:webbuilder/${site.name}`;

    window.open(`${url}`, '_blank');
  };

  renderList(site: ISiteDoc) {
    const { remove } = this.props;

    return (
      <SiteBox key={site._id} nowrap={true}>
        <SitePreview>
          <img
            src={site.templateImage || '/images/template-preview.png'}
            alt="site-img"
          />

          <PreviewContent>
            <Button
              btnStyle="white"
              onClick={() => this.showSite(site)}
              icon="eye"
            >
              {__('View site')}
            </Button>
          </PreviewContent>
        </SitePreview>
        <Content>
          <div>
            <b>{site.name}</b>
            <span>{site.domain || __('View site')}</span>
          </div>
          <Dropdown>
            <Dropdown.Toggle as={DropdownToggle} id="dropdown-convert-to">
              <Icon icon="ellipsis-h" size={18} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <a href={`/webbuilder/sites/edit/${site._id}`}>
                <li key="editor">
                  <Icon icon="edit-3" /> {__('Editor')}
                </li>
              </a>
              <li key="delete" onClick={() => remove(site._id)}>
                <Icon icon="trash-alt" size={14} /> {__('Delete')}
              </li>
            </Dropdown.Menu>
          </Dropdown>
        </Content>
      </SiteBox>
    );
  }

  render() {
    const { sites = [] } = this.props;

    return <FlexWrap>{sites.map(site => this.renderList(site))}</FlexWrap>;
  }
}

export default SiteList;
