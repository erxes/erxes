import Button from 'modules/common/components/Button';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import React from 'react';
import ProductForm from '../../containers/product/ProductForm';
import EmailTemplateForm from 'modules/settings/emailTemplates/components/Form';
import ResponseTemplateForm from 'modules/settings/responseTemplates/components/Form';
import GrowthHacksTemplateForm from 'modules/settings/growthHacks/components/TemplateForm';

import { IButtonMutateProps } from 'modules/common/types';

type Props = {
  queryParams: any;
  renderButtonEmailTemplates: (props: IButtonMutateProps) => JSX.Element;
  renderButtonResponseTemplates: (props: IButtonMutateProps) => JSX.Element;
  renderButtonGrowthHackTemplates: (props: IButtonMutateProps) => JSX.Element;
};

class ActionBar extends React.Component<Props> {
  render() {
    const triggerProduct = (
      <div style={{ marginLeft: '15px', cursor: 'pointer' }}>
        Products & Services
      </div>
    );

    const triggerEmail = (
      <div style={{ marginLeft: '15px', cursor: 'pointer' }}>Email</div>
    );

    const triggerResponse = (
      <div style={{ marginLeft: '15px', cursor: 'pointer' }}>Chat Response</div>
    );

    const triggerGrowthHacking = (
      <div style={{ marginLeft: '15px', cursor: 'pointer' }}>
        Growth Hacking
      </div>
    );

    const modalContent = props => <ProductForm {...props} />;

    const modelContentEmail = props => {
      return (
        <EmailTemplateForm
          {...props}
          renderButton={this.props.renderButtonEmailTemplates}
        />
      );
    };

    const modelContentResponse = props => {
      return (
        <ResponseTemplateForm
          {...props}
          renderButton={this.props.renderButtonResponseTemplates}
        />
      );
    };

    const modelContentGrowthHacks = props => {
      return (
        <GrowthHacksTemplateForm
          {...props}
          renderButton={this.props.renderButtonGrowthHackTemplates}
        />
      );
    };

    return (
      <Dropdown alignRight={true}>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-properties">
          <Button btnStyle="primary">
            {__('Add new template')}
            <Icon icon="angle-down" />
          </Button>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <ModalTrigger
            title="Add new template"
            trigger={triggerEmail}
            autoOpenKey="showProductModal"
            content={modelContentEmail}
            size="lg"
          />
          <ModalTrigger
            title="Add new template"
            trigger={triggerResponse}
            autoOpenKey="showProductModal"
            content={modelContentResponse}
            size="lg"
          />
          <ModalTrigger
            title="Add new template"
            trigger={triggerGrowthHacking}
            autoOpenKey="showProductModal"
            content={modelContentGrowthHacks}
            size="lg"
          />
          <ModalTrigger
            title="Add new template"
            trigger={triggerProduct}
            autoOpenKey="showProductModal"
            content={modalContent}
            size="lg"
          />
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default ActionBar;
