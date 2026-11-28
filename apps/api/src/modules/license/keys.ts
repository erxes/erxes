import type { JWK } from 'jose';

/**
 * erxes' public keys that verify a license (`ERXES_LICENSE`). They are built in, so no server
 * setting can add one: only erxes, who holds the private keys, issues licenses. A new key ships
 * in a release before erxes signs with it; an old one stays until the licenses it signed end.
 */
export const ERXES_LICENSE_KEYS: JWK[] = [
  {
    kty: 'EC',
    crv: 'P-256',
    kid: 'erxes-license-2026',
    x: 'uBBhkBUvwVg5j6zH3K7o9ayQLlXF9o1Ud0mybrch5P4',
    y: 'mf8p_RR6JgU4IsZjdYt-xBMCH6uN1RTNm5QgSOp8Xdw',
  },
];
