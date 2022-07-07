import { Link } from 'react-router-dom';
import GrapesJS from 'grapesjs';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import 'grapesjs/dist/css/grapes.min.css';
import { IPage } from '../types';

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
