import { Button } from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import PropTypes from 'prop-types';
import * as React from 'react';

type Props = {
  object: any,
  save: (params: { doc: any}, callback: () => void, object: any) => void,

};

class Form extends React.Component<Props> {
  static contextTypes =  {
    closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
  }

  constructor(props: Props) {
    super(props);

    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();

    this.props.save(
      this.generateDoc(),
      () => {
        this.context.closeModal();
      },
      this.props.object
    );
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <form onSubmit={this.save}>
        {this.renderContent(this.props.object || {})}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={onClick}
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
