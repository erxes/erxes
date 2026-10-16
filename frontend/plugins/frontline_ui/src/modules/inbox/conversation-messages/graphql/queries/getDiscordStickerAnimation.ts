import { gql } from '~/gql';

export const GET_DISCORD_STICKER_ANIMATION = gql(`
  query frontlineDiscordStickerAnimation($stickerId: String!) {
    discordStickerAnimation(stickerId: $stickerId)
  }
`);
