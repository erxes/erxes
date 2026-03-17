import { useLocation, useParams } from 'react-router-dom';

export const Widgets = (props: any) => {
  const location = useLocation();
  const { id } = useParams();

  const queryParams = new URLSearchParams(location.search);
  const kind = queryParams.get('kind');

  // fallback for direct route
  const contentId = props?.contentId || id;
  const module = props?.module || 'invoice';

  console.log({ kind, contentId, module });

  return (
    <div>
      Payment Widget <br />
      Kind: {kind} <br />
      Invoice: {contentId}
    </div>
  );
};

export default Widgets;
