import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { Wrapper } from 'modules/layout/components';
import { Button } from 'modules/common/components';
import { ContentBox } from '../../styles';
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
      <ContentBox>
        <form onSubmit={this.handleSubmit}>
          <SelectBrand brands={this.props.brands} />

          <Modal.Footer>
            <Button btnStyle="success" type="submit" icon="checkmark">
              Save
            </Button>
          </Modal.Footer>
        </form>
      </ContentBox>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/integrations' },
      { title: 'Integrations' }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        content={content}
      />
    );
  }
}

Twitter.propTypes = {
  brands: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired
};

export default Twitter;
