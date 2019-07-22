import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import RTG from 'react-transition-group';
import BrandList from '../containers/BrandList';
import { Description, Footer, TopContent } from './styles';

type Props = {
  brandsTotalCount: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  changeStep: () => void;
};

class BrandAdd extends React.Component<
  Props,
  { brandName: string; showBrands: boolean }
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showBrands: true,
      brandName: ''
    };
  }

  handleInput = e => {
    e.preventDefault();
    this.setState({ brandName: e.target.value });
  };

  toggleBrands = () => {
    this.setState({ showBrands: !this.state.showBrands });
  };

  renderOtherBrands = () => {
    const { brandsTotalCount } = this.props;

    if (brandsTotalCount === 0) {
      return null;
    }

    const { showBrands } = this.state;

    return (
      <>
        <Description>
          <Icon icon="checked-1" /> {__('You already have')}{' '}
          <b>{brandsTotalCount}</b> {__('brands')}.{' '}
          <a href="#toggle" onClick={this.toggleBrands}>
            {showBrands ? __('Hide') : __('Show')} ›
          </a>
        </Description>

        <RTG.CSSTransition
          in={showBrands}
          appear={true}
          timeout={300}
          classNames="slide-in-small"
          unmountOnExit={true}
        >
          <BrandList brandCount={brandsTotalCount} />
        </RTG.CSSTransition>
      </>
    );
  };

  renderFormContent = (formProps: IFormProps) => {
    const { changeStep, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <TopContent>
          <h2>{__(`Let's create your brand`)}</h2>

          <FormGroup>
            <ControlLabel required={true}>Brand Name</ControlLabel>

            <FormControl
              {...formProps}
              name="name"
              value={this.state.brandName}
              onChange={this.handleInput}
              autoFocus={true}
              required={true}
            />
          </FormGroup>

          {this.renderOtherBrands()}
        </TopContent>
        <Footer>
          <div>
            <Button btnStyle="link" disabled={true}>
              Previous
            </Button>

            {renderButton({
              name: 'brand',
              values,
              callback: changeStep,
              isSubmitted
            })}
          </div>
          <a href="#skip" onClick={changeStep}>
            {__('Skip for now')} »
          </a>
        </Footer>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderFormContent} />;
  }
}

export default BrandAdd;
