import {
  FormGroup,
  ControlLabel,
  Button,
  CollapseContent,
  Icon,
  ModalTrigger
} from 'erxes-ui';
import { LeftItem } from 'erxes-ui/lib/components/step/styles';
import React from 'react';
import { Description, FlexColumn, FlexItem, LinkButton } from '../../../styles';
import Select from 'react-select-plus';
import { PRODUCT_DETAIL } from '../../../constants';
import { IPosConfig } from '../../../types';
import GroupForm from '../../containers/productGroup/GroupForm';

type Props = {
  onChange: (name: 'config' | 'description', value: any) => void;
  config?: IPosConfig;
};

class OptionsStep extends React.Component<Props, {}> {
  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };

  renderAddGroup = () => {
    const { renderButton, creatable = true } = this.props;

    if (!creatable) {
      return;
    }

    const trigger = (
      <Button btnStyle="primary" icon="plus-circle">
        Add group
      </Button>
    );

    const content = props => (
      <GroupForm group={{}} {...props} renderButton={renderButton} />
    );

    return (
      <ModalTrigger title="Add grop" trigger={trigger} content={content} />
    );
  };

  render() {
    const { config } = this.props;

    const onChangeMultiCombo = values => {
      console.log(values);
      this.onChangeFunction('config', { productDetails: values });
    };

    const productDetails = config ? config.productDetails || [] : [];

    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            <CollapseContent title="Default Settings">
              <FormGroup>
                <ControlLabel>Product Details</ControlLabel>
                <Description>
                  Select pos to display in the product card.
                </Description>
                <Select
                  options={PRODUCT_DETAIL}
                  value={productDetails}
                  onChange={onChangeMultiCombo}
                  multi={true}
                />
              </FormGroup>
            </CollapseContent>
            <CollapseContent
              title="Product Groups"
              description="Select pos to display in the product category."
            >
              {this.renderAddGroup()}
            </CollapseContent>
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default OptionsStep;
