import 'grapesjs/dist/css/grapes.min.css';

import {
  CollapseLeftMenu,
  ItemDetailContainer,
  LeftSidebar,
  LeftSidebarContent,
  Loader,
  SettingsContent,
  SiteFormContainer,
  SubTitle
} from './styles';
import { IContentTypeDoc, IPage, IPageDoc } from '../../types';
import { __, uploadHandler } from '@erxes/ui/src/utils';

import Alert from '@erxes/ui/src/utils/Alert';
import ContentTypeForm from '../../containers/contentTypes/ContentTypeForm';
import ContentTypeList from '../../containers/contentTypes/List';
import Detail from '../../containers/sites/Detail';
import EntryList from '../../containers/entries/List';
import { FlexItem } from '@erxes/ui/src/components/step/styles';
import GrapesJS from 'grapesjs';
import Icon from '@erxes/ui/src/components/Icon';
import PageForm from '../pages/PageForm';
import PageList from '../pages/List';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import customPlugins from '../customPlugins';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import { readFile } from '@erxes/ui/src/utils/core';

type Props = {
  pages: IPageDoc[];
  queryParams: any;
  _id: string;
};

type State = {
  name: string;
  description: string;
  siteId: string;
  settingsObject: any;
  showDarkMode: boolean;
  showPage: boolean;
  loading: boolean;
  showContentType: boolean;
  type?: string;
};

class SiteForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const page = props.page ? props.page : props.pages[0];

    this.state = {
      name: page.name,
      description: page.description,
      siteId: page.siteId,
      settingsObject: null,
      showPage: false,
      showContentType: false,
      loading: false,
      showDarkMode:
        localStorage.getItem('showDarkMode') === 'true' ? true : false || false
    };
  }

  onChange = (type: string, value: any) => {
    this.setState({ [type]: value } as any);
  };

  onSelectSite = (value: any) => {
    this.setState({ siteId: value });
  };

  toggleSubTitle = (key: string, value: boolean) => {
    this.setState({ [key]: value } as any);
  };

  handleItemSettings = (settingsObject: any, type: string) => {
    this.setState({ settingsObject, type });
  };

  handleDarkMode = () => {
    this.setState({ showDarkMode: !this.state.showDarkMode }, () => {
      localStorage.setItem('showDarkMode', this.state.showDarkMode.toString());
    });
  };

  onLoad = (loading?: boolean) => {
    this.setState({ loading: loading ? loading : false });
  };

  // pageSave = (
  //   pageName: string,
  //   pageDescription: string,
  //   pageId: string,
  //   pageSlug?: string
  // ) => {
  //   const e = this.grapes;

  //   this.props.pageSave(
  //     pageName,
  //     pageDescription,
  //     this.props._id,
  //     // pageId ? e.getHtml() : "",
  //     // pageId ? e.getCss({ keepUnusedStyles: true }) : "",
  //     "",
  //     "",
  //     pageId,
  //     this.handleItemSettings(null, "")
  //   );
  // };

  renderLeftSidebar() {
    const { pages = [], _id, queryParams } = this.props;
    const { showDarkMode, showContentType, showPage } = this.state;

    return (
      <LeftSidebar
        className={`${!showDarkMode ? 'gjs-one-bg gjs-two-color' : 'darkmode'}`}
      >
        <CollapseLeftMenu>
          <div>{__('Navigator')}</div>
          <Icon
            icon={showDarkMode ? 'sun-1' : `moon-1`}
            size={15}
            onClick={() => this.handleDarkMode()}
          />
        </CollapseLeftMenu>

        <SubTitle
          className="collapses"
          onClick={() => this.toggleSubTitle('showPage', !showPage)}
        >
          <i
            className={`gjs-caret-icon fa fa-caret-${
              showPage ? 'right' : 'down'
            }`}
          />
          &emsp;{__('Pages')}
        </SubTitle>
        {!showPage && (
          <LeftSidebarContent>
            <PageList
              pages={pages}
              siteId={_id}
              queryParams={queryParams}
              onLoad={this.onLoad}
              handleItemSettings={this.handleItemSettings}
            />
          </LeftSidebarContent>
        )}

        <SubTitle
          className="collapses"
          onClick={() =>
            this.toggleSubTitle('showContentType', !showContentType)
          }
        >
          <i
            className={`gjs-caret-icon fa fa-caret-${
              showContentType ? 'right' : 'down'
            }`}
          />{' '}
          &emsp;
          {__('Content Type Builder')}
        </SubTitle>
        {!showContentType && (
          <LeftSidebarContent>
            <ContentTypeList
              siteId={this.props._id}
              handleItemSettings={this.handleItemSettings}
            />
          </LeftSidebarContent>
        )}
      </LeftSidebar>
    );
  }

  render() {
    const { _id, queryParams, pages } = this.props;
    const { name, settingsObject, showDarkMode, type, loading } = this.state;
    const breadcrumb = [{ title: 'Sites', link: '/xbuilder' }, { title: name }];

    return (
      <>
        <Wrapper.Header title={'Site Edit Form'} breadcrumb={breadcrumb} />

        <SiteFormContainer showDarkMode={showDarkMode}>
          <FlexItem>
            {this.renderLeftSidebar()}
            <Detail
              _id={_id}
              queryParams={queryParams}
              pages={pages}
              loading={loading}
              handleItemSettings={this.handleItemSettings}
              // pageSave={this.pageSave}
              type={type}
              settingsObject={settingsObject}
              onLoad={this.onLoad}
            />
          </FlexItem>
        </SiteFormContainer>
      </>
    );
  }
}

export default SiteForm;
