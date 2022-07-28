import Button from '@erxes/ui/src/components/Button';
import GrapesJS from 'grapesjs';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import { __ } from '@erxes/ui/src/utils';
import 'grapesjs/dist/css/grapes.min.css';
import Select from 'react-select-plus';
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
import { IPageDoc } from '../../types';

type Props = {
  page?: IPageDoc;
  save: (
    name: string,
    description: string,
    html: string,
    css: string,
    jsonData: any
  ) => void;
  saveTemplate: (name: string, jsonData: any) => void;
  templates: any;
  removeTemplate: (_id: string) => void;
};

type State = {
  name: string;
  description: string;
  templateId: string;
};

class PageForm extends React.Component<Props, State> {
  grapes;

  constructor(props) {
    super(props);

    const page = props.page || {};

    this.state = {
      name: page.name,
      description: page.description,
      templateId: ''
    };
  }

  componentDidMount() {
    this.grapes = GrapesJS.init({
      container: `#editor`,
      fromElement: true,
      plugins: [gjsPresetWebpage],
      storageManager: false
    });

    const { page } = this.props;

    if (page && page.jsonData) {
      this.grapes.loadProjectData(page.jsonData);
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

  selectTemplates = () => {
    const { templates } = this.props;
    const options: any[] = [{ label: ' . ' }];

    templates.map(template =>
      options.push({
        value: template._id,
        label: template.name,
        jsonData: template.jsonData
      })
    );

    return options;
  };

  onChange = (type: string, value: any) => {
    this.setState({ [type]: value } as any);
  };

  onSelectTemplate = (option: any) => {
    this.setState({ templateId: option.value });

    this.grapes.loadProjectData(option.jsonData);
  };

  save = () => {
    const e = this.grapes;

    this.props.save(
      this.state.name,
      this.state.description,
      e.getHtml(),
      e.getCss(),
      e.getProjectData()
    );
  };

  saveTemplate = () => {
    const e = this.grapes;

    this.props.saveTemplate(this.state.name || 'Template', e.getProjectData());
  };

  renderPageContent() {
    const imagePath = '/images/icons/erxes-12.svg';
    const { description, name, templateId } = this.state;
    const { removeTemplate } = this.props;

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
              <ControlLabel>Page template:</ControlLabel>
              <p>{'Choose a page template'}</p>

              <Select
                onChange={this.onSelectTemplate}
                value={templateId}
                options={this.selectTemplates()}
                clearable={false}
              />
            </FormGroup>

            {templateId ? (
              <Button
                btnStyle="danger"
                uppercase={false}
                icon="times-circle"
                size="small"
                onClick={() => removeTemplate(templateId)}
              >
                Remove a selected template
              </Button>
            ) : null}
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
            {__('You are')} {page ? 'editing' : 'creating'}
            <strong>{name}</strong> {__('page')}
          </Indicator>
          {this.renderButtons()}
        </ControlWrapper>
      </StepWrapper>
    );
  }
}

export default PageForm;
