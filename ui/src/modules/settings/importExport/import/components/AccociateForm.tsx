import React from 'react';
import { ControlLabel, FormControl, FormGroup, __ } from 'erxes-ui';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { SubHeading } from 'modules/settings/styles';

type Props = {
  duplicatedHeaders: string[];
  contentTypes: string[];
  onChangeAssociateHeader: (value: string) => void;
  onChangeAssociateContentType: (value: string) => void;
};

class AccociateForm extends React.Component<Props, {}> {
  render() {
    const onChangeHeader = e =>
      this.props.onChangeAssociateHeader((e.target as HTMLInputElement).value);

    const onChangeContentType = e =>
      this.props.onChangeAssociateContentType(
        (e.target as HTMLInputElement).value
      );

    return (
      <FlexItem>
        <FlexPad direction="column" overflow="auto">
          <SubHeading>{__('Choose how to associate your data')}</SubHeading>

          <div>
            <FormGroup>
              <ControlLabel>
                {__('Common column headers found in your file')}
              </ControlLabel>
              <p>
                {__(
                  'Choose which common column you want to use to associate your data.'
                )}
                .
              </p>
              <FormControl componentClass="select" onChange={onChangeHeader}>
                <option />
                {this.props.duplicatedHeaders.map(header => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
            <FormGroup>
              <ControlLabel>
                {__('Which object is the unique key for')}
              </ControlLabel>
              <p>
                {__(
                  'The common column between your files should also be the unique key for one of your objects. This unique key is used to associate objects based on individual data but only belongs to one object.'
                )}
                .
              </p>
              <FormControl
                componentClass="select"
                onChange={onChangeContentType}
              >
                <option />
                {this.props.contentTypes.map(contentType => (
                  <option key={contentType} value={contentType}>
                    {contentType}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
          </div>
        </FlexPad>
      </FlexItem>
    );
  }
}

export default AccociateForm;
