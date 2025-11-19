import { useSegmentConfigWidget } from '../../hooks/useSegmentConfigWidget';

export const SegmentConfigWidget = ({
  contentType,
}: {
  contentType: string;
}) => {
  const { hasSegmentConfigWidget } = useSegmentConfigWidget(contentType);
  if (!hasSegmentConfigWidget) {
    return null;
  }

  return <>{hasSegmentConfigWidget}</>;
};
