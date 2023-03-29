import 'grapesjs/dist/css/grapes.min.css';

import {
  CustomButtonWrapper,
  ItemDetailContainer,
  Loader,
  SettingsContent
} from './styles';
import { IContentTypeDoc, IPageDoc } from '../../types';
import { __, uploadHandler } from '@erxes/ui/src/utils';

import Alert from '@erxes/ui/src/utils/Alert';
import Button from '@erxes/ui/src/components/Button';
import ContentTypeForm from '../../containers/contentTypes/ContentTypeForm';
import EntryList from '../../containers/entries/List';
import { FlexItem } from '@erxes/ui/src/components/step/styles';
import GrapesJS from 'grapesjs';
import PageForm from '../pages/PageForm';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import customPlugins from '../customPlugins';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import { readFile } from '@erxes/ui/src/utils/core';

type Props = {
  page: IPageDoc;
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
  onLoad: (isLoading?: boolean) => void;
  handleItemSettings: (item: any, type: string) => void;
  contentTypes: IContentTypeDoc[];
  settingsObject: any;
  showDarkMode: boolean;
  pages: IPageDoc[];
  loading: boolean;
  queryParams: any;
  type: string;
  _id: string;
};

type State = {
  name: string;
  description: string;
};

class SiteDetail extends React.Component<Props, State> {
  grapes;

  constructor(props) {
    super(props);

    const page = props.page ? props.page : props.pages[0] || ({} as IPageDoc);

    this.state = {
      name: page.name || '',
      description: page.description || ''
    };
  }

  fetchPage = () => {
    const { contentTypes, onLoad } = this.props;
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

    onLoad(false);
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.page !== this.props.page) {
      setTimeout(() => {
        this.fetchPage();
      }, 1000);
    }
  }

  componentDidMount() {
    this.fetchPage();
  }

  pageSave = (pageName: string, pageDescription: string, pageId: string) => {
    const e = this.grapes;

    this.props.pageSave(
      pageName,
      pageDescription,
      this.props._id,
      pageId ? e.getHtml() : '',
      pageId ? e.getCss({ keepUnusedStyles: true }) : '',
      pageId,
      this.props.handleItemSettings(null, '')
    );
  };

  renderItemSettings() {
    const { settingsObject, type } = this.props;

    switch (type) {
      case 'page':
        return (
          <PageForm
            page={settingsObject}
            save={this.pageSave}
            remove={this.props.pageRemove}
            onCancel={this.props.handleItemSettings}
          />
        );
      case 'contenttype':
        return (
          <ContentTypeForm
            contentType={settingsObject}
            siteId={this.props._id}
            onCancel={this.props.handleItemSettings}
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
    const { name, description } = this.state;
    const { page, pages, settingsObject, showDarkMode, loading } = this.props;

    const pageId = page ? page._id : (pages[0] || ({} as IPageDoc))._id;

    return (
      <>
        {settingsObject && (
          <SettingsContent>
            <ItemDetailContainer>
              {this.renderItemSettings()}
            </ItemDetailContainer>
          </SettingsContent>
        )}
        <FlexItem className="right-section" count="7">
          <CustomButtonWrapper>
            <Button
              btnStyle="success"
              icon={'check-circle'}
              size="small"
              uppercase={true}
              onClick={() => this.pageSave(name, description, pageId)}
            >
              Save page
            </Button>
          </CustomButtonWrapper>
          {loading && (
            <Loader showDarkMode={showDarkMode}>
              <Spinner objective={true} />
            </Loader>
          )}
          <div id="editor" />
        </FlexItem>
      </>
    );
  }
}

export default SiteDetail;
