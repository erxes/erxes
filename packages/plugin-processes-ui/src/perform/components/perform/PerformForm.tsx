import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import CommonForm from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { router } from '@erxes/ui/src/utils';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  count: number;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      count: 0
    };

    console.log(' performForm component starting ...');
  }

  onChange = e => {
    this.setState({ count: e.target.value });
  };

  renderContent = (formProps: IFormProps) => {
    console.log(' step1 ...');

    const { closeModal, renderButton } = this.props;
    const { isSubmitted } = formProps;

    console.log(' step2 ...');

    // Object.keys(this.props.queryParams).length &&
    //   Object.keys(this.props.queryParams).includes("overallWorkId") ?
    //   this.props.queryParams.overallWorkId : "";

    console.log(' step3 ...', history);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Count</ControlLabel>
          <FormControl
            name="count"
            defaultValue={this.state.count}
            type="number"
            autoFocus={true}
            required={true}
            onChange={this.onChange}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: 'Performance',
            values: { count: this.state.count },
            isSubmitted,
            callback: closeModal,
            object: null
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
