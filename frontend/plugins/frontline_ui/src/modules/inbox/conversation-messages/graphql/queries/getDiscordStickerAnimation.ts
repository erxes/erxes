import { gql } from '@apollo/client';

export const GET_DISCORD_STICKER_ANIMATION = gql`
  query frontlineDiscordStickerAnimation($stickerId: String!) {
    discordStickerAnimation(stickerId: $stickerId)
  }
`;
