import type { DefaultInlineContentSchema, DefaultStyleSchema } from '@blocknote/core';
import { videoBlockConfig, videoParse } from '@blocknote/core';
import type { ReactCustomBlockRenderProps } from '@blocknote/react';
import {
  createReactBlockSpec,
  FigureWithCaption,
  ResizableFileBlockWrapper,
  useBlockNoteEditor,
  VideoBlock,
  VideoToExternalHTML,
} from '@blocknote/react';
import { IconVideo } from '@tabler/icons-react';
import type { FC } from 'react';
import { getCloudflareStreamBase, parseVideoEmbedUrl } from 'erxes-ui/utils/videoEmbed';

type VideoRenderProps = ReactCustomBlockRenderProps<
  typeof videoBlockConfig,
  DefaultInlineContentSchema,
  DefaultStyleSchema
>;

type FileBlockSchema = Parameters<
  typeof ResizableFileBlockWrapper
>[0]['editor']['schema']['blockSchema'];

const getVideoEmbedSource = (url: string): string | undefined => {
  const embed = parseVideoEmbedUrl(url);
  const streamBase = getCloudflareStreamBase(url);

  return embed?.embedUrl || (streamBase ? `${streamBase}/iframe` : undefined);
};

const EmbeddedVideo: FC<{ src: string; title: string }> = ({ src, title }) => (
  <iframe
    className="bn-visual-media aspect-video h-auto max-w-full border-0"
    width="640"
    height="360"
    src={src}
    title={title || 'Video'}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
    // oxlint-disable-next-line react/iframe-missing-sandbox -- src is always a YouTube, Vimeo or Cloudflare Stream player (cross-origin, so the frame can't reach this page), and those players need their own origin's storage to play
    sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
    referrerPolicy="strict-origin-when-cross-origin"
    contentEditable={false}
  />
);

export const CustomVideoBlockContent: FC<VideoRenderProps> = (props) => {
  // The same editor, typed for the file block wrapper: its generic schema doesn't
  // accept the video block's editor type directly.
  const fileEditor = useBlockNoteEditor<FileBlockSchema>();
  const src = getVideoEmbedSource(props.block.props.url);

  if (!src) {
    return <VideoBlock {...props} />;
  }

  return (
    <ResizableFileBlockWrapper
      block={props.block}
      editor={fileEditor}
      buttonText={props.editor.dictionary.file_blocks.video.add_button_text}
      buttonIcon={<IconVideo size={24} />}
    >
      <EmbeddedVideo src={src} title={props.block.props.name} />
    </ResizableFileBlockWrapper>
  );
};

const ExternalVideoHtml: FC<VideoRenderProps> = (props) => {
  const src = getVideoEmbedSource(props.block.props.url);

  if (!src || !props.block.props.showPreview) {
    return <VideoToExternalHTML {...props} />;
  }

  const video = <EmbeddedVideo src={src} title={props.block.props.name} />;

  return props.block.props.caption ? (
    <FigureWithCaption caption={props.block.props.caption}>{video}</FigureWithCaption>
  ) : (
    video
  );
};

export const customVideoBlock = createReactBlockSpec(videoBlockConfig, {
  render: CustomVideoBlockContent,
  toExternalHTML: ExternalVideoHtml,
  parse: (element) => {
    const video = videoParse(element);

    if (video) return video;

    if (element.tagName === 'IFRAME' && element.closest('figure')) {
      return undefined;
    }

    const iframe =
      element.tagName === 'IFRAME'
        ? element
        : element.tagName === 'FIGURE'
          ? element.querySelector('iframe')
          : null;

    const url = getVideoEmbedSource(iframe?.getAttribute('src') || '');

    if (!url) return undefined;

    return {
      url,
      caption: element.querySelector('figcaption')?.textContent || '',
    };
  },
});
