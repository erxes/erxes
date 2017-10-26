import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, ButtonToolbar } from 'react-bootstrap';
import { Wrapper } from 'modules/layout/components';
import { Button } from 'modules/common/components';
import Sidebar from '../../Sidebar';
import SelectBrand from './SelectBrand';

class Twitter extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.save(document.getElementById('selectBrand').value);
  }

  render() {
    const content = (
      <form className="margined" onSubmit={this.handleSubmit}>
        <SelectBrand brands={this.props.brands} />

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button type="submit" btnStyle="primary">
              Save
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/integrations' },
      { title: 'Integrations' }
    ];

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={breadcrumb} />}
          leftSidebar={<Sidebar />}
          content={content}
        />
      </div>
    );
  }
}

Twitter.propTypes = {
  brands: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired
};

export default Twitter;
