import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import * as RTG from 'react-transition-group';
import { BrandList } from '../containers';
import { Description, Footer, TopContent } from './styles';

type Props = {
  brandsTotalCount: number;
  save: (name: string, callback: () => void) => void;
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

  save = e => {
    e.preventDefault();
    const { save } = this.props;

    save(this.state.brandName, this.clearInput.bind(this));
  };

  next = e => {
    e.preventDefault();
    const { changeStep, save } = this.props;
    save(this.state.brandName, changeStep);
  };

  handleInput = e => {
    e.preventDefault();
    this.setState({ brandName: e.target.value });
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

  renderContent() {
    const { brandName } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Brand Name</ControlLabel>

          <FormControl
            value={brandName}
            onChange={this.handleInput}
            type="text"
            autoFocus={true}
            required={true}
          />
        </FormGroup>

        {this.renderOtherBrands()}
      </>
    );
  }

  render() {
    const { changeStep } = this.props;

    return (
      <form onSubmit={this.save}>
        <TopContent>
          <h2>{__(`Let's create your brand`)}</h2>
          {this.renderContent()}
        </TopContent>
        <Footer>
          <div>
            <Button btnStyle="link" disabled={true}>
              Previous
            </Button>
            <Button
              btnStyle="success"
              disabled={!this.state.brandName}
              onClick={this.next}
            >
              {__('Next')} <Icon icon="rightarrow-2" />
            </Button>
          </div>
          <a onClick={changeStep}>{__('Skip for now')} »</a>
        </Footer>
      </form>
    );
  }
}

export default BrandAdd;
