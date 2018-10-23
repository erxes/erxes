import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import Toggle from 'react-toggle';
import { SelectBrand } from '../..';
import { ITopic } from '../../../../../knowledgeBase/types';

type Props = {
  onChange: (
    name: 'brandId' | 'languageCode' | 'notifyCustomer',
    value: string
  ) => void;
  brandId?: string;
  brands?: IBrand[];
  notifyCustomer?: boolean;
  topics?: ITopic[];
  topicId?: string;
};

class Options extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.onChangeFunction = this.onChangeFunction.bind(this);
  }

  onChangeFunction(name, value) {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
  }

  render() {
    const brandOnChange = e => this.onChangeFunction('brandId', e.target.value);
    const notifyCustomerChange = e =>
      this.onChangeFunction('notifyCustomer', e.target.checked);
    const onTopicChange = e =>
      this.onChangeFunction('knowledgeBaseTopicId', e.target.value);
    const { topics, topicId } = this.props;

    return (
      <FlexItem>
        <LeftItem>
          <SelectBrand
            brands={this.props.brands || []}
            defaultValue={this.props.brandId}
            onChange={brandOnChange}
          />

          <FormGroup>
            <ControlLabel>Knowledge Base Topic</ControlLabel>

            <FormControl
              componentClass="select"
              placeholder={__('Select Topic')}
              onChange={onTopicChange}
              defaultValue={topicId}
            >
              <option />
              {(topics || []).map(topic => (
                <option key={topic._id} value={topic._id}>
                  {topic.title}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Notify customer</ControlLabel>
            <div>
              <Toggle
                className="wide"
                checked={this.props.notifyCustomer}
                onChange={notifyCustomerChange}
                icons={{
                  checked: <span>Yes</span>,
                  unchecked: <span>No</span>
                }}
              />
            </div>
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Options;
