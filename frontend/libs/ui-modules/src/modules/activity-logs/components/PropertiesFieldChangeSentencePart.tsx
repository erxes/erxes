import { Badge } from 'erxes-ui';
import { formatPropertyFieldValue } from '../utils/propertyFieldChangedActivity';

interface PropertiesFieldChangeSentencePartProps {
  name: string;
  props: {
    value: unknown;
    fieldType?: string;
    options: Array<{ label?: string; value?: string }>;
  };
}

export const PropertiesFieldChangeSentencePart = ({
  name,
  props,
}: PropertiesFieldChangeSentencePartProps) => {
  return (
    <>
      <span className="text-muted-foreground">{name}</span>
      <span>
        <Badge variant="secondary">{formatPropertyFieldValue(props)}</Badge>
      </span>
    </>
  );
};
