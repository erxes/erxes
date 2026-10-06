import type {
  APIEmbedImage,
  APIEmbedThumbnail,
  APIEmbedVideo,
} from 'discord-api-types/v10';

export type TEmbedMedia = APIEmbedImage | APIEmbedThumbnail | APIEmbedVideo;
