import { RuleTester } from 'vite-plus/lint/plugins-dev';
import { describe, it } from 'vite-plus/test';

import { noSilentCatchRule } from './no-silent-catch.ts';

RuleTester.describe = describe;

RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } });
const error = { messageId: 'silentCatch' };

tester.run('anti-slop/no-silent-catch', noSilentCatchRule, {
  valid: [
    'load().catch((error) => { logger.warn({ err: error }); return null; });',
    'load().catch((error) => (isNotFound(error) ? null : Promise.reject(error)));',
    'load().catch(() => fallbackRows());',
    'load().then(() => null);',
    'function read() { try { return load(); } catch (error) { if (isNotFound(error)) return null; throw error; } }',
    'function read() { try { return load(); } catch (error) { logger.warn({ err: error }); return []; } }',
    'function read() { try { return load(); } catch (error) { report(error); return {}; } }',
    'function read() { try { return null; } catch (error) { throw error; } }',
    'function read() { try { return load(); } catch (error) { return { ok: false, error }; } }',
    'function read() { try { return load(); } catch { return fallback(); } }',
    'function read() { try { load(); } catch (error) { const list = () => []; throw error; } }',
    'function read() { try { load(); } catch (error) { switch (code(error)) { case "ENOENT": return null; default: throw error; } } }',
  ],
  invalid: [
    { name: 'catch to null', code: 'load().catch(() => null);', errors: [error] },
    { name: 'catch to undefined', code: 'load().catch(() => undefined);', errors: [error] },
    { name: 'catch to empty array', code: 'load().catch(() => []);', errors: [error] },
    { name: 'catch to empty object', code: 'load().catch(() => ({}));', errors: [error] },
    { name: 'catch to nothing', code: 'load().catch(() => {});', errors: [error] },
    {
      name: 'catch callback returning a default',
      code: 'load().catch((error) => { return null; });',
      errors: [error],
    },
    {
      name: 'catch block returning null',
      code: 'function read() { try { return load(); } catch { return null; } }',
      errors: [error],
    },
    {
      name: 'catch block with an unused error',
      code: 'function read() { try { return load(); } catch (error) { return []; } }',
      errors: [error],
    },
    {
      name: 'bare return',
      code: 'function read() { try { load(); } catch (error) { return; } }',
      errors: [error],
    },
    {
      name: 'branch that does not look at the error',
      code: 'function read() { try { return load(); } catch (error) { if (retry) return null; throw error; } }',
      errors: [error],
    },
  ],
});
