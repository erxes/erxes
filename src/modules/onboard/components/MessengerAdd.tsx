import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { LANGUAGES } from 'modules/settings/general/constants';
import { InstallCode } from 'modules/settings/integrations/components';
import { SelectBrand } from 'modules/settings/integrations/containers';
import { IIntegration } from 'modules/settings/integrations/types';
import React from 'react';
import { Modal } from 'react-bootstrap';
import RTG from 'react-transition-group';
import { MessengerList } from '../containers';
import { Description, Footer, TopContent } from './styles';

type Props = {
  totalCount: number;
  integration?: IIntegration;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  changeStep: (increase: boolean) => void;
  showInstallCode: boolean;
  closeInstallCodeModal: () => void;
};

type State = {
  name: string;
  language: string;
  brandId: string;
  showMessengers: boolean;
};

class MessengerAdd extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { showMessengers: true, name: '', brandId: '', language: '' };
  }

  changeStep = () => {
    return this.props.changeStep(true);
  };

  toggleMessengers = () => {
    this.setState({ showMessengers: !this.state.showMessengers });
  };

  goNext = () => {
    if (this.props.closeInstallCodeModal) {
      this.props.closeInstallCodeModal();
    }

    this.props.changeStep(true);
  };

  handleChange = <T extends keyof State>(name: T, e) => {
    e.preventDefault();
    this.setState({ [name]: e.target.value } as Pick<State, keyof State>);
  };

  renderOtherMessengers = () => {
    const { totalCount } = this.props;

    if (totalCount === 0) {
      return null;
    }

    const { showMessengers } = this.state;

    return (
      <>
        <Description>
          <Icon icon="checked-1" /> {__('You already have')} <b>{totalCount}</b>{' '}
          {__('messengers')}.
          <a href="#toggle" onClick={this.toggleMessengers}>
            {showMessengers ? __('Hide') : __('Show')} ›
          </a>
        </Description>

        <RTG.CSSTransition
          in={showMessengers}
          appear={true}
          timeout={300}
          classNames="slide-in-small"
          unmountOnExit={true}
        >
          <MessengerList />
        </RTG.CSSTransition>
      </>
    );
  };

  renderInstallCode() {
    const { integration, closeInstallCodeModal, showInstallCode } = this.props;

    return (
      <Modal show={showInstallCode} onHide={closeInstallCodeModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>{__('Install code')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InstallCode
            integration={integration || ({} as IIntegration)}
            closeModal={closeInstallCodeModal}
            positivButton={
              <Button btnStyle="success" onClick={this.goNext}>
                {__('Next')} <Icon icon="rightarrow-2" />
              </Button>
            }
          />
        </Modal.Body>
      </Modal>
    );
  }

  renderFormContent = (formProps: IFormProps) => {
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Messenger name</ControlLabel>

          <FormControl
            {...formProps}
            name="name"
            autoFocus={true}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Messenger Language</ControlLabel>

          <FormControl
            {...formProps}
            componentClass="select"
            name="languageCode"
            required={true}
          >
            <option />
            {LANGUAGES.map((item, index) => (
              <option key={index} value={item.value}>
                {item.label}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <SelectBrand
          isRequired={true}
          creatable={false}
          formProps={formProps}
        />

        {this.renderOtherMessengers()}
      </>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <TopContent>
          <h2>{__('Start messaging now!')}</h2>
          {this.renderFormContent({ ...formProps })}
        </TopContent>
        <Footer>
          <div>
            <Button
              btnStyle="link"
              onClick={this.props.changeStep.bind(null, false)}
            >
              Previous
            </Button>
            {renderButton({
              name: 'app',
              values,
              isSubmitted
            })}
          </div>
          <a href="#skip" onClick={this.goNext}>
            {__('Skip for now')} »
          </a>
        </Footer>
      </>
    );
  };

  render() {
    return (
      <>
        <Form renderContent={this.renderContent} />
        {this.renderInstallCode()}
      </>
    );
  }
}

export default MessengerAdd;
