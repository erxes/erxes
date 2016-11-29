import React, { PropTypes, Component } from 'react';
import {
  Modal,
  Button,
  ButtonToolbar,
} from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from '../../Sidebar.jsx';
import SelectBrand from './SelectBrand.jsx';


class Social extends Component {
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
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/integrations' },
      { title: 'Integrations' },
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

Social.propTypes = {
  brands: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
};

export default Social;
