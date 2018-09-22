import React, { Component } from 'react';
import { SelectBrand } from '..';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from '../../../../common/components';
import { ModalFooter } from '../../../../common/styles/main';
import { __ } from '../../../../common/utils';
import { IBrand } from '../../../brands/types';
import { IFacebookApp, IPages } from '../../types';

type Props = {
  save: (params: {name: string, brandId: string, appId: string, pageIds: string[]}) => void;
  onAppSelect: (appId: string) => void;
  brands: IBrand[];
  apps: IFacebookApp[];
  pages: IPages[];
};

class Facebook extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onAppChange = this.onAppChange.bind(this);
  }

  onAppChange() {
    const appId = (document.getElementById('app') as HTMLInputElement).value;
    this.props.onAppSelect(appId);
  }

  collectCheckboxValues(name) {
    const values: string[] = [];
    const elements = document.getElementsByName(name);

    // tslint:disable-next-line
    for (let i=0; i<elements.length; i++) {
      const element = elements[i] as HTMLInputElement;

      if (element.checked) {
        values.push(element.value);
      }
    }

    return values;
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.save({
      name: (document.getElementById('name') as HTMLInputElement).value,
      brandId: (document.getElementById('selectBrand') as HTMLInputElement).value,
      appId: (document.getElementById('app') as HTMLInputElement).value,
      pageIds: this.collectCheckboxValues('pages')
    });
  }

  render() {
    const { apps, pages, brands } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl id="name" type="text" required />
        </FormGroup>

        <SelectBrand brands={brands} />

        <FormGroup>
          <ControlLabel>App</ControlLabel>

          <FormControl
            componentClass="select"
            placeholder={__('Select app')}
            onChange={this.onAppChange}
            id="app"
          >
            <option value="">Select app ...</option>

            {apps.map((app, index) => (
              <option key={`app${index}`} value={app.id}>
                {app.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Pages</ControlLabel>

          {pages.map(page => (
            <div key={page.id}>
              <FormControl
                componentClass="checkbox"
                name="pages"
                key={page.id}
                value={page.id}
              >
                {page.name}
              </FormControl>
            </div>
          ))}
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default Facebook;
