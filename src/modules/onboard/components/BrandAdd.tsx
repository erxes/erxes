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
import * as React from 'react';
import * as RTG from 'react-transition-group';
import { BrandList } from '../containers';
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

  clearInput() {
    this.setState({ brandName: '' });
  }

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
          <a href="javascript:;" onClick={this.toggleBrands}>
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
              defaultValue={this.state.brandName}
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
              isSubmitted
            })}
          </div>
          <a onClick={changeStep}>{__('Skip for now')} »</a>
        </Footer>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderFormContent} />;
  }
}

export default BrandAdd;
