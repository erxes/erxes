import {
  BASIC_FUNCTIONS,
  ButtonApi,
  CardApi,
  CheckBoxApi,
  ChoicePickerApi,
  ColumnApi,
  DateTimeInputApi,
  DividerApi,
  ListApi,
  RowApi,
  TabsApi,
  TextApi,
  TextFieldApi,
} from '@a2ui/web_core/catalogs/basic/v1';
import { Catalog, type ComponentApi, createFunctionImplementation } from '@a2ui/web_core/v1_0';
import { z } from 'zod';
import {
  BadgeApi,
  CalloutApi,
  ChartApi,
  FlowApi,
  MemberPickerApi,
  RecordPickerApi,
  StatApi,
  TableApi,
} from './components';

export {
  BadgeApi,
  CalloutApi,
  ChartApi,
  FlowApi,
  MemberPickerApi,
  RecordPickerApi,
  StatApi,
  TableApi,
  ButtonApi,
  CardApi,
  CheckBoxApi,
  ChoicePickerApi,
  ColumnApi,
  DateTimeInputApi,
  DividerApi,
  ListApi,
  RowApi,
  TabsApi,
  TextApi,
  TextFieldApi,
};

export const ASSISTANT_CATALOG_ID = 'https://erxes.io/a2ui/catalogs/assistant/v1.json';

export const ASSISTANT_PROTOCOL = '1.0';

export const ASSISTANT_COMPONENT_APIS: ComponentApi[] = [
  TextApi,
  RowApi,
  ColumnApi,
  ListApi,
  CardApi,
  TabsApi,
  DividerApi,
  ButtonApi,
  TextFieldApi,
  CheckBoxApi,
  ChoicePickerApi,
  DateTimeInputApi,
  StatApi,
  BadgeApi,
  TableApi,
  ChartApi,
  MemberPickerApi,
  RecordPickerApi,
  CalloutApi,
  FlowApi,
];

const INSTRUCTIONS = `Lay a surface out with Column and Row; put related content in a Card.

Text renders Markdown. A record reference such as [[ref:k2Xp9aQ0vB7LmN4rT]] inside a Text or a Table cell shows as a live link with the record's current name, so write the reference in place of the name.

Use Stat for headline numbers, Table for records or figures in columns, Chart for a trend or a split, and Badge for a status. Use Flow to show an automation, workflow or plan as steps, Callout for something missing or blocking (with a Button that fixes it when you can), and RecordPicker or MemberPicker when the answer is a record or a team member.

An input keeps what the member enters at the data path it is bound to. Initialise every bound path. A Button's Event(name, context) sends the click to you as the member's next message, with the context's values read at that moment: pass each input's path in the context. The member sees those values under their message, so give options values they can read, such as "sms" or "this_quarter". openPage(path) opens a workspace page instead.

To join text with a bound value, use formatString("Hello \${/user/name}"); there are no operators such as +.

Give a validation check its own message; do not add a Text for the error.`;

const UNWANTED = new Set(['openUrl']);

const OPEN_PAGE = {
  name: 'openPage',
  returnType: 'void',
  requiresUserActivation: true,
  description:
    'Opens a page of the workspace in the app, such as a list page. Takes a path that starts with "/" and that a [Page context] line or a tool gave you; never guess one. To open a record, write its reference in a Text instead.',
  schema: z.object({
    path: z
      .string()
      .regex(/^\/(?!\/)[^\s]*$/)
      .describe('The workspace path, such as "/contacts/customers".'),
  }),
} as const;

export const assistantCatalog = <T extends ComponentApi>(
  components: readonly T[],
  openPage: (path: string) => void,
): Catalog<T> =>
  new Catalog<T>(
    ASSISTANT_CATALOG_ID,
    ASSISTANT_PROTOCOL,
    components,
    [
      ...BASIC_FUNCTIONS.filter(({ name }) => !UNWANTED.has(name)),
      createFunctionImplementation(OPEN_PAGE, ({ path }) => openPage(path)),
    ],
    { instructions: INSTRUCTIONS, declaredProtocolVersion: ASSISTANT_PROTOCOL },
  );
