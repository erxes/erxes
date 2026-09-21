import {
  DefaultInlineContentSchema,
  DefaultStyleSchema,
  videoBlockConfig,
  videoParse,
} from '@blocknote/core';
import {
  createReactBlockSpec,
  FigureWithCaption,
  ReactCustomBlockRenderProps,
  ResizableFileBlockWrapper,
  VideoBlock,
  VideoToExternalHTML,
} from '@blocknote/react';
import { IconVideo } from '@tabler/icons-react';
import { FC } from 'react';
import {
  getCloudflareStreamBase,
  parseVideoEmbedUrl,
} from '../../../utils/videoEmbed';

type VideoRenderProps = ReactCustomBlockRenderProps<
  typeof videoBlockConfig,
  DefaultInlineContentSchema,
  DefaultStyleSchema
>;

type FileBlockRenderProps = Omit<
  Parameters<typeof ResizableFileBlockWrapper>[0],
  'buttonText' | 'buttonIcon' | 'children'
>;

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
    referrerPolicy="strict-origin-when-cross-origin"
    sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
    contentEditable={false}
  />
);

export const CustomVideoBlockContent: FC<VideoRenderProps> = (props) => {
  const src = getVideoEmbedSource(props.block.props.url);

  if (!src) {
    return <VideoBlock {...props} />;
  }

  const fileProps = props as unknown as FileBlockRenderProps;

  return (
    <ResizableFileBlockWrapper
      {...fileProps}
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
    <FigureWithCaption caption={props.block.props.caption}>
      {video}
    </FigureWithCaption>
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
