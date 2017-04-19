import React, { PropTypes, Component } from 'react';
import { _ } from 'meteor/underscore';
import {
  Modal,
  Button,
  ButtonToolbar,
  FormGroup,
  FormControl,
  ControlLabel,
  Checkbox,
} from 'react-bootstrap';
import SelectBrand from './SelectBrand';

class Facebook extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onAppChange = this.onAppChange.bind(this);
  }

  onAppChange() {
    this.props.getPages(document.getElementById('app').value);
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
      pageIds: this.collectCheckboxValues('pages'),
    });
  }

  render() {
    const { brands, apps, pages } = this.props;

    return (
      <form className="margined" onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl id="name" type="text" required />
        </FormGroup>

        <SelectBrand brands={brands} />

        <FormGroup controlId="app">
          <ControlLabel>App</ControlLabel>

          <FormControl componentClass="select" placeholder="Select app" onChange={this.onAppChange}>
            <option>Select app ...</option>

            {apps.map((app, index) => (
              <option key={`app${index}`} value={app.id}>{app.name}</option>
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

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }
}

Facebook.propTypes = {
  save: PropTypes.func.isRequired,
  getPages: PropTypes.func.isRequired,
  brands: PropTypes.array.isRequired,
  apps: PropTypes.array.isRequired,
  pages: PropTypes.array.isRequired,
};

export default Facebook;
