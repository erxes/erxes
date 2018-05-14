import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SelectBrand from './SelectBrand';
import {
  Button,
  Form,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';

class Facebook extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onAppChange = this.onAppChange.bind(this);
  }

  onAppChange() {
    const appId = document.getElementById('app').value;
    this.props.onAppSelect(appId);
  }

  collectCheckboxValues(name) {
    const values = [];
    const elements = document.getElementsByName(name);

    elements.forEach(element => {
      if (element.checked) {
        values.push(element.value);
      }
    });

    return values;
  }

  handleSubmit(doc) {
    this.props.save({
      name: doc.name,
      brandId: doc.selectBrand,
      appId: doc.app,
      pageIds: this.collectCheckboxValues('pages')
    });
  }

  render() {
    const { __ } = this.context;
    const { apps, pages, brands } = this.props;

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            name="name"
            type="text"
            validations="isValue"
            validationError="Please enter a name"
          />
        </FormGroup>

        <SelectBrand brands={brands} />

        <FormGroup>
          <ControlLabel>App</ControlLabel>

          <FormControl
            componentClass="select"
            placeholder={__('Select app')}
            onChange={this.onAppChange}
            validations="isValue"
            validationError="Please select a app"
            name="app"
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
      </Form>
    );
  }
}

Facebook.propTypes = {
  save: PropTypes.func.isRequired,
  onAppSelect: PropTypes.func.isRequired,
  brands: PropTypes.array.isRequired,
  apps: PropTypes.array.isRequired,
  pages: PropTypes.array.isRequired
};

Facebook.contextTypes = {
  __: PropTypes.func
};

export default Facebook;
