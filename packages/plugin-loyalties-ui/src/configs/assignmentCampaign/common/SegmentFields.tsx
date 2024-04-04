import { gql, useQuery } from '@apollo/client';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import { ControlLabel, FormGroup, Spinner } from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Select from 'react-select-plus';

function SegmentFields({
  assignmentCampaign,
  segmentIds,
  onChange
}: {
  assignmentCampaign: any;
  segmentIds: string[];
  onChange: (value, name) => void;
}) {
  if (!segmentIds?.length) {
    return null;
  }

  const { data, loading } = useQuery(
    gql(formQueries.fieldsCombinedByContentType),
    {
      variables: {
        contentType: 'contacts:customer',
        segmentId: segmentIds[0]
      }
    }
  );

  if (loading) {
    return <Spinner objective />;
  }

  const { fieldsCombinedByContentType } = data;

  const options = fieldsCombinedByContentType
    .filter(field => field?.type === 'input' && field?.validation === 'number')
    .map(field => {
      let value = field._id;

      if (field.name.includes('customFieldsData')) {
        value = field.name.replace('customFieldsData.', '');
      }

      return { value, label: field.label };
    });

  return (
    <FormGroup>
      <ControlLabel>{__('Counter Field of Segment (Optional)')}</ControlLabel>
      <Select
        options={options}
        value={assignmentCampaign.fieldId}
        name="fieldId"
        loadingPlaceholder={__('Loading...')}
        onChange={({ value }) => onChange(value, 'fieldId')}
      />
    </FormGroup>
  );
}

export default SegmentFields;
