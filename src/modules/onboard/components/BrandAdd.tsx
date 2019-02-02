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

    this.state = { showBrands: true, brandName: '' };
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

  renderContent() {
    const { brandName, showBrands } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel>Brand Name</ControlLabel>

          <FormControl
            value={brandName}
            onChange={this.handleInput}
            type="text"
            required={true}
          />
        </FormGroup>

        <Description>
          <Icon icon="checked-1" /> {__('You already have')}{' '}
          <b>{this.props.brandsTotalCount}</b> {__('brands')}.{' '}
          <a href="javascript:;" onClick={this.toggleBrands}>
            {showBrands ? __('Show') : __('Hide')} ›
          </a>
        </Description>

        <RTG.CSSTransition
          in={showBrands}
          appear={true}
          timeout={300}
          classNames="slide-in-small"
          unmountOnExit={true}
        >
          <BrandList brandCount={this.props.brandsTotalCount} />
        </RTG.CSSTransition>
      </>
    );
  }

  render() {
    const { brandsTotalCount, changeStep } = this.props;

    return (
      <form onSubmit={this.save}>
        <TopContent>
          <h2>{__('Create brand')}</h2>
          {this.renderContent()}
        </TopContent>
        <Footer>
          <div>
            <Button btnStyle="link" disabled={true}>
              Previous
            </Button>
            <Button
              btnStyle="success"
              disabled={brandsTotalCount === 0}
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
