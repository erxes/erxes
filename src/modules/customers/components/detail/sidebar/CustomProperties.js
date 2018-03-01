import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { SidebarContent } from 'modules/layout/styles';
import styled from 'styled-components';
import { dimensions } from 'modules/common/styles';
import { GenerateField } from 'modules/settings/properties/components';

const FieldWrapper = styled.div`
  margin-bottom: ${dimensions.coreSpacing}px;
`;

const propTypes = {
  data: PropTypes.object.isRequired,
  fieldsGroups: PropTypes.array.isRequired,
  toggleEditing: PropTypes.func.isRequired
};

function CustomProperties({ data, fieldsGroups, toggleEditing }) {
  const { Section } = Sidebar;

  return (
    <FieldWrapper id="fields">
      {fieldsGroups.map(fieldGroup => {
        if (!fieldGroup.isVisible) return null;

        return (
          <Section key={fieldGroup._id}>
            <Section.Title>{fieldGroup.name}</Section.Title>

            <SidebarContent>
              {fieldGroup.fields.map((field, index) => {
                if (!field.isVisible) return null;

                return (
                  <GenerateField
                    field={field}
                    id={field._id}
                    key={index}
                    onValueChange={() => toggleEditing()}
                    defaultValue={
                      data.customFieldsData
                        ? data.customFieldsData[field._id]
                        : ''
                    }
                  />
                );
              })}
            </SidebarContent>
          </Section>
        );
      })}
    </FieldWrapper>
  );
}

CustomProperties.propTypes = propTypes;

export default CustomProperties;
