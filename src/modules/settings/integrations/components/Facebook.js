import _ from 'underscore';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'react-bootstrap';
import SelectBrand from './SelectBrand';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/styles';

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

    _.each(document.getElementsByName(name), elem => {
      if (elem.checked) {
        values.push(elem.value);
      }
    });

    return values;
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.save({
      name: document.getElementById('name').value,
      brandId: document.getElementById('selectBrand').value,
      appId: document.getElementById('app').value,
      pageIds: this.collectCheckboxValues('pages')
    });
  }

  render() {
    const { __ } = this.context;
    const { apps, pages, brands } = this.props;

    return (
      <form className="margined" onSubmit={this.handleSubmit}>
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
              <Checkbox name="pages" key={page.id} value={page.id}>
                {page.name}
              </Checkbox>
            </div>
          ))}
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="success" type="submit" icon="checkmark">
            Save
          </Button>
        </ModalFooter>
      </form>
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
