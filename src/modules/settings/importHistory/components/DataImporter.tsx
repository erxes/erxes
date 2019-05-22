import { Icon } from 'modules/common/components';
import { colors } from 'modules/common/styles';
import { lighten } from 'modules/common/styles/color';
import { __ } from 'modules/common/utils';
import { rotate } from 'modules/common/utils/animations';
import * as React from 'react';
import styled from 'styled-components';

const ImportButton = styled.label`
  border-radius: 30px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  padding: 6px 15px 6px 32px;
  background: ${colors.colorCoreGreen};
  font-size: 10px;
  color: ${colors.colorWhite};
  box-shadow: 0 2px 16px 0 ${lighten(colors.colorCoreGreen, 35)};
  position: relative;

  i {
    top: 5px;
    position: absolute;
    left: 12px;
  }

  input {
    display: none;
  }

  &:hover {
    cursor: pointer;
    text-decoration: none;
    box-shadow: 0 2px 22px 0 ${lighten(colors.colorCoreGreen, 25)};
  }
`;

const ImportLoader = styled.i`
  width: 14px;
  height: 14px;
  animation: ${rotate} 0.75s linear infinite;
  border: 1px solid ${colors.borderDarker};
  border-top-color: ${colors.colorPrimary};
  border-right-color: ${colors.colorPrimary};
  border-radius: 100%;
`;

type Props = {
  uploadXls: (e: React.FormEvent<HTMLInputElement>) => void;
  uploading: boolean;
  text: string;
};

function DataImporter({ uploadXls, uploading, text }: Props) {
  return (
    <ImportButton>
      {uploading ? <ImportLoader /> : <Icon icon="download-1" />}
      {text}
      <input
        type="file"
        onChange={uploadXls}
        accept=".xlsx, .xls"
        disabled={uploading}
      />
    </ImportButton>
  );
}

export default DataImporter;
