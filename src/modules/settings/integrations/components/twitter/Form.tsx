import { Button } from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { IBrand } from 'modules/settings/brands/types';
import { SelectBrand } from 'modules/settings/integrations/components';
import { ContentBox } from 'modules/settings/styles';
import * as React from 'react';

type Props = {
  brands: IBrand[];
  save: (brand: string) => void;
};

class Twitter extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.save(
      (document.getElementById('selectBrand') as HTMLInputElement).value
    );
  }

  render() {
    const content = (
      <ContentBox>
        <form onSubmit={this.handleSubmit}>
          <SelectBrand brands={this.props.brands} />

          <ModalFooter>
            <Button btnStyle="success" type="submit" icon="checked-1">
              Save
            </Button>
          </ModalFooter>
        </form>
      </ContentBox>
    );

    const breadcrumb = [
      { title: __('Settings'), link: '/settings/integrations' },
      { title: __('Integrations') }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        content={content}
      />
    );
  }
}

export default Twitter;
