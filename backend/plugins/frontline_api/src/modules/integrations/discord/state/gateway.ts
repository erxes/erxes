import { DiscordGatewayConnection } from '@/integrations/discord/gatewayClient';

export const connectionKey = (subdomain: string, token: string) =>
  `${subdomain}:${token}`;

export const connections = new Map<string, DiscordGatewayConnection>();

export const ownedSubdomains = new Set<string>();

export const ownedTokens = new Map<string, Set<string>>();

export const ownerLoops = new Set<string>();

export const trackOwnedToken = (subdomain: string, token: string) => {
  let set = ownedTokens.get(subdomain);
  if (!set) {
    set = new Set<string>();
    ownedTokens.set(subdomain, set);
  }
  set.add(token);
};

export const untrackToken = (subdomain: string, token: string) => {
  ownedTokens.get(subdomain)?.delete(token);
};
