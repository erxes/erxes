import _ from 'underscore';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ButtonToolbar,
  FormGroup,
  FormControl,
  ControlLabel,
  Checkbox
} from 'react-bootstrap';
import SelectBrand from './SelectBrand';
import { Button } from 'modules/common/components';

class Facebook extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onAppChange = this.onAppChange.bind(this);

    this.state = { apps: [], pages: [] };
  }

  componentDidMount() {
    // TODO
    // const { apps } = this.state;
    //
    // if (apps.length === 0) {
    //   Meteor.call('integrations.getFacebookAppList', (err, res) => {
    //     this.setState({ apps: res });
    //   });
    // }
  }

  onAppChange() {
    // TODO
    // const appId = document.getElementById('app').value;
    //
    // Meteor.call('integrations.getFacebookPageList', { appId }, (err, res) => {
    //   if (err) {
    //     return Alert.error(err.reason);
    //   }
    //
    //   this.setState({ pages: res });
    // });
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
    const { brands } = this.props;
    const { apps, pages } = this.state;

    return (
      <form className="margined" onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl id="name" type="text" required />
        </FormGroup>

        <SelectBrand brands={brands} />

        <FormGroup controlId="app">
          <ControlLabel>App</ControlLabel>

          <FormControl
            componentClass="select"
            placeholder="Select app"
            onChange={this.onAppChange}
          >
            <option>Select app ...</option>

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

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button type="submit" btnStyle="primary">
              Save
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }
}

Facebook.propTypes = {
  save: PropTypes.func.isRequired,
  brands: PropTypes.array.isRequired
};

export default Facebook;
