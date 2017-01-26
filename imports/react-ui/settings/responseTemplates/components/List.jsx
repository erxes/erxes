import React, { PropTypes, Component } from 'react';
import { Button, Table } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import { ModalTrigger } from '/imports/react-ui/common';
import { Form } from '../containers';
import Sidebar from '../../Sidebar.jsx';
import Row from './Row.jsx';

const propTypes = {
  objects: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  removeResTemplate: PropTypes.func.isRequired,
};

class List extends Component {
  constructor(props) {
    super(props);

    this.renderObjects = this.renderObjects.bind(this);
  }

  renderObject(object) {
    const { removeResTemplate } = this.props;

    return (
      <tr>
        <td>{object.brand().name}</td>
        <td>{object.name}</td>
        <td>{object.content}</td>

        <td>
          <button onClick={removeResTemplate}>remove</button>
        </td>
      </tr>
    );
  }

  renderObjects() {
    const { objects, brands, removeResTemplate } = this.props;

    return objects.map(resTemplate =>
      <Row
        brands={brands}
        key={resTemplate._id}
        resTemplate={resTemplate}
        removeResTemplate={removeResTemplate}
      />,
    );
  }

  render() {
    const trigger = (
      <Button bsStyle="link">
        <i className="ion-plus-circled" /> New response template
      </Button>
    );

    const actionBarLeft = (
      <ModalTrigger title="New response template" trigger={trigger}>
        <Form resTemplate={{}} brands={this.props.brands} />
      </ModalTrigger>
    );

    const actionBar = (
      <Wrapper.ActionBar left={actionBarLeft} />
    );

    const content = (
      <Table>
        <thead>
          <tr>
            <th>Brand</th>
            <th>Name</th>
            <th>content</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {this.renderObjects()}
        </tbody>
      </Table>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/response-templates' },
      { title: 'Response templates' },
    ];

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={breadcrumb} />}
          leftSidebar={<Sidebar />}
          actionBar={actionBar}
          content={content}
        />
      </div>
    );
  }
}

List.propTypes = propTypes;

export default List;
