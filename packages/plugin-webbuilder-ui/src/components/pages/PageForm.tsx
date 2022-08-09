import Button from '@erxes/ui/src/components/Button';
import { readFile } from '@erxes/ui/src/utils/core';
import GrapesJS from 'grapesjs';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import { uploadHandler, __ } from '@erxes/ui/src/utils';
import 'grapesjs/dist/css/grapes.min.css';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FlexItem, FlexPad } from '@erxes/ui/src/components/step/styles';
import { EditorContainer } from '@erxes/ui-engage/src/styles';
import { Indicator } from '@erxes/ui/src/components/step/styles';
import { ControlWrapper } from '@erxes/ui/src/components/step/styles';
import Step from '@erxes/ui/src/components/step/Step';
import Steps from '@erxes/ui/src/components/step/Steps';
import { StepWrapper } from '@erxes/ui/src/components/step/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

import React from 'react';
import { Link } from 'react-router-dom';
import { IContentTypeDoc, IPageDoc, ITemplateDoc } from '../../types';
import customPlugins from './customPlugins';
import SelectSite from '../../containers/sites/SelectSite';
import Alert from '@erxes/ui/src/utils/Alert';

type Props = {
  page?: IPageDoc;
  save: (
    name: string,
    description: string,
    siteId: string,
    html: string,
    css: string,
    jsonData: any
  ) => void;
  saveTemplate: (name: string, jsonData: any, html: string) => void;
  contentTypes: IContentTypeDoc[];
  pages: IPageDoc[];
  template: ITemplateDoc;
};

type State = {
  name: string;
  description: string;
  siteId: string;
};

class PageForm extends React.Component<Props, State> {
  grapes;

  constructor(props) {
    super(props);

    const page = props.page || {};

    this.state = {
      name: page.name,
      description: page.description,
      siteId: page.siteId
    };
  }

  componentDidMount() {
    const { page, contentTypes, template } = this.props;
    let { pages } = this.props;

    pages = pages.filter(p => p._id !== page?._id);

    this.grapes = GrapesJS.init({
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

    if (page && page.jsonData) {
      this.grapes.loadProjectData(page.jsonData);
    } else if (template && template.jsonData) {
      this.grapes.loadProjectData(template.jsonData);
    }

    const editor = this.grapes;

    const pfx = editor.getConfig().stylePrefix;
    const modal = editor.Modal;
    const cmdm = editor.Commands;
    const codeViewer = editor.CodeManager.getViewer('CodeMirror').clone();
    const pnm = editor.Panels;
    const container = document.createElement('div');
    const btnEdit = document.createElement('button');

    codeViewer.set({
      codeName: 'htmlmixed',
      readOnly: 0,
      theme: 'hopscotch',
      autoBeautify: true,
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineWrapping: true,
      styleActiveLine: true,
      smartIndent: true,
      indentWithTabs: true
    });

    editor.getConfig().allowScripts = 1;
    btnEdit.innerHTML = 'Edit';
    btnEdit.className = pfx + 'btn-prim ' + pfx + 'btn-import';
    btnEdit.onclick = () => {
      const code = codeViewer.editor.getValue();
      editor.DomComponents.getWrapper().set('content', '');
      editor.setComponents(code.trim());
      modal.close();
    };

    cmdm.add('html-edit', {
      run: (editr, sender) => {
        if (sender) {
          sender.set('active', 0);
        }

        let viewer = codeViewer.editor;

        modal.setTitle('Edit code');

        if (!viewer) {
          const txtarea = document.createElement('textarea');
          container.appendChild(txtarea);
          container.appendChild(btnEdit);
          codeViewer.init(txtarea);
          viewer = codeViewer.editor;
        }

        const InnerHtml = editr.getHtml();
        const Css = editr.getCss();
        modal.setContent('');
        modal.setContent(container);
        codeViewer.setContent(InnerHtml + '<style>' + Css + '</style>');
        modal.open();
        viewer.refresh();
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

  save = () => {
    const e = this.grapes;

    this.props.save(
      this.state.name,
      this.state.description,
      this.state.siteId,
      e.getHtml(),
      e.getCss(),
      e.getProjectData()
    );
  };

  saveTemplate = () => {
    const e = this.grapes;

    this.props.saveTemplate(
      this.state.name || 'Template',
      e.getProjectData(),
      e.getHtml()
    );
  };

  renderPageContent() {
    const imagePath = '/images/icons/erxes-12.svg';
    const { description, name, siteId } = this.state;

    return (
      <Step img={imagePath} title="Manage web builder page" noButton={true}>
        <FlexItem>
          <FlexPad direction="column" overflow="auto">
            <FormGroup>
              <ControlLabel>Name:</ControlLabel>
              <FormControl
                placeholder="Enter a name"
                onChange={(e: any) => this.onChange('name', e.target.value)}
                defaultValue={name}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Description:</ControlLabel>
              <FormControl
                placeholder="Enter a description"
                onChange={(e: any) =>
                  this.onChange('description', e.target.value)
                }
                defaultValue={description}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Site:</ControlLabel>
              <SelectSite
                label="Choose a site"
                name="siteId"
                onSelect={this.onSelectSite}
                multi={false}
                initialValue={siteId}
              />
            </FormGroup>
          </FlexPad>

          <FlexItem overflow="auto" count="7">
            <EditorContainer>
              <div id="editor" />
            </EditorContainer>
          </FlexItem>
        </FlexItem>
      </Step>
    );
  }

  renderButtons = () => {
    const cancelButton = (
      <Link to="/webbuilder/pages">
        <Button btnStyle="simple" icon="times-circle">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}

        <Button
          btnStyle="warning"
          icon={'check-circle'}
          onClick={this.saveTemplate}
        >
          Save as template
        </Button>

        <Button btnStyle="success" icon={'check-circle'} onClick={this.save}>
          Save
        </Button>
      </Button.Group>
    );
  };

  render() {
    const { name } = this.state;
    const { page } = this.props;

    const breadcrumb = [
      { title: 'Webbuilder', link: '/webbuilder/pages' },
      { title: __('Page') }
    ];

    return (
      <StepWrapper>
        <Wrapper.Header title={'Page Form'} breadcrumb={breadcrumb} />
        <Steps>{this.renderPageContent()}</Steps>

        <ControlWrapper>
          <Indicator>
            {__('You are')} {page ? 'editing ' : 'creating '}
            <strong>{name}</strong> {__('page')}
          </Indicator>
          {this.renderButtons()}
        </ControlWrapper>
      </StepWrapper>
    );
  }
}

export default PageForm;
