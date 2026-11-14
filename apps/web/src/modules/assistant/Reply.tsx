import { type Components, defaultComponents, type ExtraProps, Streamdown } from 'streamdown';
import { ReferenceChip, TableChips } from './RecordChip';
import { referenceOfHref, withReferenceLinks } from './references';
import { replyLink } from './replyLinks';

const NO_IMAGES = ['img'];

const DefaultLink = defaultComponents.a;

const DefaultTh = defaultComponents.th;

const DefaultTd = defaultComponents.td;

const ReplyLink = (props: React.JSX.IntrinsicElements['a'] & ExtraProps) => {
  const handle = referenceOfHref(props.href);

  if (handle) return <ReferenceChip handle={handle} />;

  if (DefaultLink) return <DefaultLink {...props} />;

  return <a href={props.href}>{props.children}</a>;
};

const ReplyTh = ({ children, ...props }: React.JSX.IntrinsicElements['th'] & ExtraProps) =>
  DefaultTh ? (
    <DefaultTh {...props} className="px-2 py-1.5 text-xs whitespace-normal">
      {children}
    </DefaultTh>
  ) : (
    <th>{children}</th>
  );

const ReplyTd = ({ children, ...props }: React.JSX.IntrinsicElements['td'] & ExtraProps) => {
  const cell = <TableChips>{children}</TableChips>;

  return DefaultTd ? (
    <DefaultTd {...props} className="px-2 py-1.5 align-top">
      {cell}
    </DefaultTd>
  ) : (
    <td>{cell}</td>
  );
};

const COMPONENTS: Components = { a: ReplyLink, th: ReplyTh, td: ReplyTd };

export const Reply = ({ text, streaming }: { text: string; streaming: boolean }) => (
  <Streamdown
    className="flex min-w-0 flex-col gap-2 text-sm leading-relaxed break-words"
    mode={streaming ? 'streaming' : 'static'}
    isAnimating={streaming}
    controls={{ table: false, code: true, mermaid: false }}
    skipHtml
    disallowedElements={NO_IMAGES}
    urlTransform={replyLink}
    components={COMPONENTS}
  >
    {withReferenceLinks(text, streaming)}
  </Streamdown>
);
