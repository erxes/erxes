interface WidgetsProps {
  module: unknown; // Replace 'unknown' with the actual module type
  contentId: string;
  contentType: string;
}
export function Widgets({ module, contentId, contentType }: WidgetsProps) {
  return <div>template Widget</div>;
}
