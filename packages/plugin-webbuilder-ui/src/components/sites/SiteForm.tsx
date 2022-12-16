import 'grapesjs/dist/css/grapes.min.css';

import {
  CollapseLeftMenu,
  ItemDetailContainer,
  LeftSidebar,
  LeftSidebarContent,
  SettingsContent,
  SiteFormContainer,
  SubTitle
} from './styles';
import { IContentTypeDoc, IPageDoc } from '../../types';
import { __, uploadHandler } from '@erxes/ui/src/utils';

import Alert from '@erxes/ui/src/utils/Alert';
import ContentTypeForm from '../../containers/contentTypes/ContentTypeForm';
import ContentTypeList from '../../containers/contentTypes/List';
import EntryList from '../../containers/entries/List';
import { FlexItem } from '@erxes/ui/src/components/step/styles';
import GrapesJS from 'grapesjs';
import Icon from '@erxes/ui/src/components/Icon';
import PageForm from '../pages/PageForm';
import PageList from '../pages/List';
import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import customPlugins from '../customPlugins';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import { readFile } from '@erxes/ui/src/utils/core';

type Props = {
  page?: IPageDoc;
  pageSave: (
    name: string,
    description: string,
    siteId: string,
    html: string,
    css: string,
    pageId?: string,
    afterSave?: any
  ) => void;
  pageRemove: (_id: string, afterSave?: any) => void;
  contentTypes: IContentTypeDoc[];
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
  showContentType: boolean;
  type?: string;
};

class SiteForm extends React.Component<Props, State> {
  grapes;

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
      showDarkMode:
        localStorage.getItem('showDarkMode') === 'true' ? true : false || false
    };
  }

  componentDidMount() {
    const { contentTypes } = this.props;
    let { pages } = this.props;

    const page = this.props.page ? this.props.page : pages[0];
    pages = pages.filter(p => p._id !== page?._id);

    this.grapes = GrapesJS.init({
      protectedCss: '',
      container: `#editor`,
      fromElement: true,
      plugins: [gjsPresetWebpage, customPlugins],
      pluginsOpts: {
        [customPlugins as any]: {
          pages,
          contentTypes,
          open: false
        }
      },
      storageManager: false,
      assetManager: {
        uploadFile: e => {
          const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;

          uploadHandler({
            files,

            beforeUpload: () => {
              Alert.warning(
                'Upload in progress. Please wait until response shows.'
              );
            },

            afterUpload: ({ status, response, fileInfo }) => {
              if (status !== 'ok') {
                Alert.error(response.statusText);
              }

              Alert.info('Success');

              editor.AssetManager.add({
                type: fileInfo.type,
                src: readFile(response),
                height: 350,
                width: 250,
                name: fileInfo.name
              });
            }
          });
        }
      }
    });

    const editor = this.grapes;

    const pfx = editor.getConfig().stylePrefix;
    const modal = editor.Modal;
    const cmdm = editor.Commands;
    const htmlCodeViewer = editor.CodeManager.getViewer('CodeMirror').clone();
    const cssCodeViewer = editor.CodeManager.getViewer('CodeMirror').clone();
    const pnm = editor.Panels;
    const container = document.createElement('div');
    const btnEdit = document.createElement('button');

    const codeViewerOptions = {
      theme: 'hopscotch',
      autoBeautify: true,
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineWrapping: true,
      styleActiveLine: true,
      smartIndent: true,
      indentWithTabs: true,
      readOnly: 0
    };

    htmlCodeViewer.set({
      codeName: 'htmlmixed',
      ...codeViewerOptions
    });

    cssCodeViewer.set({
      codeName: 'css',
      ...codeViewerOptions
    });

    editor.getConfig().allowScripts = 1;
    btnEdit.innerHTML = 'Edit';
    btnEdit.className = pfx + 'btn-prim ' + pfx + 'btn-import';
    btnEdit.onclick = () => {
      const html = htmlCodeViewer.editor.getValue();
      const css = cssCodeViewer.editor.getValue();

      editor.DomComponents.getWrapper().set('content', '');

      editor.setComponents(html.trim());
      editor.setStyle(css.trim());

      modal.close();
    };

    // don't move this block
    if (page && page.html) {
      const { html, css } = page;

      editor.setComponents(html);
      editor.setStyle(css.trim());
    }

    cmdm.add('html-edit', {
      run: (editr, sender) => {
        // tslint:disable-next-line:no-unused-expression
        sender && sender.set('active', 0);
        let htmlViewer = htmlCodeViewer.editor;
        let cssViewer = cssCodeViewer.editor;

        modal.setTitle('Edit code');

        if (!htmlViewer && !cssViewer) {
          const htmlArea = document.createElement('textarea');
          const htmlLabel = document.createElement('p');
          htmlLabel.innerHTML = 'Html';

          const cssArea = document.createElement('textarea');
          const cssLabel = document.createElement('p');
          cssLabel.innerHTML = 'Css';

          container.appendChild(htmlLabel);
          container.appendChild(htmlArea);

          container.appendChild(cssLabel);
          container.appendChild(cssArea);

          container.appendChild(btnEdit);

          htmlCodeViewer.init(htmlArea);
          cssCodeViewer.init(cssArea);

          htmlViewer = htmlCodeViewer.editor;
          cssViewer = cssCodeViewer.editor;
        }

        const InnerHtml = editr.getHtml();
        const Css = editr.getCss({ keepUnusedStyles: true });

        modal.setContent('');
        modal.setContent(container);

        htmlCodeViewer.setContent(InnerHtml);
        cssCodeViewer.setContent(Css);

        modal.open();

        htmlViewer.refresh();
        cssViewer.refresh();
      }
    });

    pnm.addButton('options', [
      {
        id: 'edit',
        className: 'fa fa-edit',
        command: 'html-edit',
        attributes: {
          title: 'Edit'
        }
      }
    ]);
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

  pageSave = (
    pageName: string,
    pageDescription: string,
    pageId: string,
    pageSlug?: string
  ) => {
    const e = this.grapes;

    this.props.pageSave(
      pageName,
      pageDescription,
      this.props._id,
      pageId ? e.getHtml() : '',
      pageId ? e.getCss({ keepUnusedStyles: true }) : '',
      pageId,
      this.handleItemSettings(null, '')
    );
  };

  renderItemSettings() {
    const { settingsObject, type } = this.state;

    switch (type) {
      case 'page':
        return (
          <PageForm
            page={settingsObject}
            save={this.pageSave}
            remove={this.props.pageRemove}
            onCancel={this.handleItemSettings}
          />
        );
      case 'contenttype':
        return (
          <ContentTypeForm
            contentType={settingsObject}
            siteId={this.props._id}
            onCancel={this.handleItemSettings}
          />
        );
      case 'entries':
        return (
          <EntryList
            contentType={settingsObject}
            queryParams={this.props.queryParams}
          />
        );
      default:
        return null;
    }
  }

  render() {
    const { name, settingsObject, showDarkMode } = this.state;

    const breadcrumb = [
      { title: 'Sites', link: '/webbuilder' },
      { title: name }
    ];

    return (
      <>
        <Wrapper.Header title={'Site Edit Form'} breadcrumb={breadcrumb} />

        <SiteFormContainer showDarkMode={showDarkMode}>
          <FlexItem>
            {this.renderLeftSidebar()}
            {settingsObject && (
              <SettingsContent>
                <ItemDetailContainer>
                  {this.renderItemSettings()}
                </ItemDetailContainer>
              </SettingsContent>
            )}
            <FlexItem count="7">
              <div id="editor" />
            </FlexItem>
          </FlexItem>
        </SiteFormContainer>
      </>
    );
  }
}

export default SiteForm;
