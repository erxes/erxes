import { Streamdown } from 'streamdown';
import { replyLink } from './replyLinks';

const NO_IMAGES = ['img'];

export const Reply = ({ text, streaming }: { text: string; streaming: boolean }) => (
  <Streamdown
    className="flex min-w-0 flex-col gap-2 text-sm leading-relaxed break-words"
    mode={streaming ? 'streaming' : 'static'}
    isAnimating={streaming}
    controls={{ table: false, code: true, mermaid: false }}
    skipHtml
    disallowedElements={NO_IMAGES}
    urlTransform={replyLink}
  >
    {text}
  </Streamdown>
);
