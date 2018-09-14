import { Button } from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import * as React from 'react';

type Props = {
  object: any,
  save: (params: { doc: any}, callback: () => void, object: any) => void,
  closeModal: () => void,
};

class Form extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.save = this.save.bind(this);
  }

  generateDoc() {
    return { doc: {} };
  }

  save(e) {
    e.preventDefault();

    this.props.save(
      this.generateDoc(),
      this.props.closeModal,
      this.props.object
    );
  }

  renderContent({}) {
    return null;
  }

  render() {
    return (
      <form onSubmit={this.save}>
        {this.renderContent(this.props.object || {})}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
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
