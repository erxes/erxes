# erxes-ui

Shared React components, business modules, hooks, and frontend state for erxes.

## Install in a React application

```sh
npm install @erxes/ui
```

```tsx
import { Button } from '@erxes/ui';

export function Example() {
  return <Button onClick={() => window.alert('Hello')}>Continue</Button>;
}
```

The published package contains JavaScript and automatically imports its compiled
stylesheet. Vite source aliases, `process.env` shims, Tailwind plugins, source
scanning, and copied theme declarations are not required to render components.
Match the React version with the package's peer dependencies.

Component subpaths also include the stylesheet:

```tsx
import { Button } from '@erxes/ui/components/button';
```

The stylesheet covers the classes used by the library. Configure Tailwind in your
application if you want to generate additional utility classes of your own.
Override CSS variables such as `--primary` to customize the default theme. Add
the `dark` class to a parent element to select the dark theme.

`@erxes/ui/theme.css` remains available for applications that already compile
Tailwind and supply their own design tokens. The compiled stylesheet is also
exported as `@erxes/ui/styles.css` and `@erxes/ui/style.css`.

Components that use routing, GraphQL, translations, or shared state still need
their corresponding application providers. The ready-to-use stylesheet does
not configure those services.

## Build the npm package

```sh
pnpm nx build erxes-ui
pnpm --filter erxes-ui test:package
pnpm --dir frontend/libs/erxes-ui/dist pack
```

The build writes a standalone `dist/package.json`, JavaScript entries, type
declarations, and compiled CSS. The existing `theme.css` contract and the host's
default tokens are reused when compiling styles. The publish workflow packs this
directory and applies the shared platform version. Workspace consumers continue
to resolve the original source exports.

Declaration emission retains the shared-libraries workflow's existing policy:
type diagnostics are reported, while declaration-emit failures fail the build.

## Running unit tests

Run `nx test erxes-ui` to execute the unit tests via [Jest](https://jestjs.io).
