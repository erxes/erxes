import { Button } from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import * as React from 'react';
import { ICommonFormProps } from '../types';

type Props = {
  generateDoc: () => any,
  renderContent(): any,
};

class Form extends React.Component<Props & ICommonFormProps> {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();

    this.props.save(
      this.props.generateDoc(),
      this.props.closeModal,
      this.props.object
    );
  }

  render() {
    const { renderContent, closeModal } = this.props;

    return (
      <form onSubmit={this.save}>
        {renderContent()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default Form;
