const Widgets = ({
  contentType,
  contentId,
  message,
}: {
  contentType: string;
  contentId: string;
  message: string;
}) => {
  return <div>Widgets content {message}</div>;
};

export default Widgets;
