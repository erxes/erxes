export const USER_MENTION_RE = /<@!?(\d+)>/g;

export const ROLE_MENTION_RE = /<@&(\d+)>/g;

export const CHANNEL_MENTION_RE = /<#(\d+)>/g;

export const CUSTOM_EMOJI_RE = /<a?:([^:>]+):\d+>/g;

export const TIMESTAMP_RE = /<t:(\d+)(?::[tTdDfFR])?>/g;

export const MENTION_TOKEN = /\{@discord:([^}]+)\}/g;
