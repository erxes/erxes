import { Content, PreviewContent, SiteBox, SitePreview, Sites } from './styles';

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
    return (
      <SiteBox key={site._id}>
        <SitePreview>
          <img
            src="https://templatemo.com/thumbnails-360/tm-557-grad-school.jpg"
            alt="site-img"
          />
          <PreviewContent>
            <Button btnStyle="white" onClick={() => this.showSite(site)}>
              View site
            </Button>
          </PreviewContent>
        </SitePreview>
        <Content>
          <div>
            <b>{site.name}</b>
            <span>{site.domain || 'View site'}</span>
          </div>
          <Dropdown>
            <Dropdown.Toggle as={DropdownToggle} id="dropdown-convert-to">
              <Icon icon="ellipsis-h" size={18} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <li key="editor">
                <Icon icon="edit-3" /> Editor
              </li>
              <li key="delete">
                <Icon icon="trash-alt" size={14} /> Delete
              </li>
              <li key="duplicate">
                <Icon icon="copy-alt" /> Duplicate
              </li>
            </Dropdown.Menu>
          </Dropdown>
        </Content>
      </SiteBox>
    );
  }

  render() {
    const { sites } = this.props;
    console.log(sites);

    return <Sites>{(sites || []).map(site => this.renderList(site))}</Sites>;
  }
}

export default SiteList;
