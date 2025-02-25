import styledTS from 'styled-components-ts';
import styled from 'styled-components';

const ExtraRow = styledTS<{ isDefault?: boolean }>(styled.tr)`
  background: ${(props) => (props.isDefault ? '' : '#F7F8FC')};
`;

export { ExtraRow };
