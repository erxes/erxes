import { Link } from 'react-router-dom';
import GrapesJS from 'grapesjs';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import 'grapesjs/dist/css/grapes.min.css';
import { IPage } from '../../types';

type Props = {
  page?: IPage;
  save: (
    name: string,
    description: string,
    html: string,
    css: string,
    jsonData: any
  ) => void;
};

class Form extends React.Component<
  Props,
  { name: string; description: string }
> {
  grapes;

  constructor(props) {
    super(props);

    const page = props.page || {};

    this.state = {
      name: page.name,
      description: page.description
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

  onChange = (type, e) => {
    this.setState({ [type]: e.target.value } as any);
  };

  render() {
    const { name, description } = this.state;

    return (
      <div>
        <Link to="/webbuilder/pages">Back</Link>

        <p>
          <input
            placeholder="Name"
            value={name}
            onChange={this.onChange.bind(this, 'name')}
          />
        </p>

        <p>
          <input
            placeholder="Description"
            value={description}
            onChange={this.onChange.bind(this, 'description')}
          />
        </p>

        <button onClick={this.save}>Save</button>

        <div id="editor" />
      </div>
    );
  }
}

export default Form;
