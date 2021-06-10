import Button from 'modules/common/components/Button';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { IButtonMutateProps, IOption } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { Row, LeftContent } from 'modules/settings/integrations/styles';
import React from 'react';
import Select from 'react-select-plus';
import { ITag } from '../types';
import Form from './Form';

type Props = {
  tags: ITag[];
  onChange?: (values: string[]) => any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  defaultValue?: string[];
  isRequired?: boolean;
  description?: string;
  type?: string;
};

class SelectChannels extends React.Component<Props, {}> {
  renderAddBrand = () => {
    const { renderButton, tags, type = 'customer' } = this.props;

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Create
      </Button>
    );

    const content = props => (
      <Form {...props} type={type} renderButton={renderButton} tags={tags} />
    );

    return (
      <ModalTrigger title="Create tag" trigger={trigger} content={content} />
    );
  };

  generateUserOptions(array: ITag[] = []): IOption[] {
    return array.map(item => {
      const channel = item || ({} as ITag);

      return {
        value: channel._id,
        label: channel.name
      };
    });
  }

  onChange = values => {
    if (this.props.onChange) {
      this.props.onChange(values.map(item => item.value) || []);
    }
  };

  render() {
    const { tags, defaultValue, isRequired, description } = this.props;

    return (
      <FormGroup>
        <ControlLabel required={isRequired}>Tag</ControlLabel>
        <p>{description}</p>
        <Row>
          <LeftContent>
            <Select
              placeholder={__('Select tags')}
              value={defaultValue}
              onChange={this.onChange}
              options={this.generateUserOptions(tags)}
              multi={true}
            />
          </LeftContent>
          {this.renderAddBrand()}
        </Row>
      </FormGroup>
    );
  }
}

export default SelectChannels;
