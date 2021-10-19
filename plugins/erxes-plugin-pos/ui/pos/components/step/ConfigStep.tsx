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
import { IPos, IPosConfig, IProductGroup } from '../../../types';
import GroupForm from '../../containers/productGroup/GroupForm';

type Props = {
  onChange: (name: 'pos' | 'description', value: any) => void;
  pos?: IPos;
};

class OptionsStep extends React.Component<Props, {}> {
  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };

  onChangeGroup = (group: IProductGroup) => {
    console.log('onChangeGroup: ',group);
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
      <GroupForm
        group={{}}
        {...props}
        onSubmit={this.onChangeGroup}
        renderButton={renderButton}
      />
    );

    return (
      <ModalTrigger title="Add group" trigger={trigger} content={content} />
    );
  };

  render() {
    const { pos } = this.props;

    const onChangeDetail = options => {
      console.log(options);
      pos.productDetails = options.map(e => e.value);
      this.onChangeFunction('pos', pos);
    };

    const productDetails = pos ? pos.productDetails || [] : [];

    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            <CollapseContent title="Default Settings" open={true}>
              <FormGroup>
                <ControlLabel>Product Details</ControlLabel>
                <Description>
                  Select pos to display in the product card.
                </Description>
                <Select
                  options={PRODUCT_DETAIL}
                  value={productDetails}
                  onChange={onChangeDetail}
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
