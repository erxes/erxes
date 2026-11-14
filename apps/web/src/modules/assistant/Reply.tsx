import { type Components, defaultComponents, type ExtraProps, Streamdown } from 'streamdown';
import { ReferenceChip } from './RecordChip';
import { referenceOfHref, withReferenceLinks } from './references';
import { replyLink } from './replyLinks';

const NO_IMAGES = ['img'];

const DefaultLink = defaultComponents.a;

const ReplyLink = (props: React.JSX.IntrinsicElements['a'] & ExtraProps) => {
  const handle = referenceOfHref(props.href);

  if (handle) return <ReferenceChip handle={handle} />;

  if (DefaultLink) return <DefaultLink {...props} />;

  return <a href={props.href}>{props.children}</a>;
};

const COMPONENTS: Components = { a: ReplyLink };

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
