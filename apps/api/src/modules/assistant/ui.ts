import { A2uiError, A2uiGenerator, CatalogConfig, InMemoryCatalogProvider } from '@a2ui/agent';
import catalog from '@erxes/assistant-catalog/catalog.json';

const createProcessor = () => {
  const loaded = new InMemoryCatalogProvider(catalog).load();

  return new A2uiGenerator([new CatalogConfig(loaded)]).createProcessor({
    [loaded.protocolVersion]: { supportedCatalogIds: [loaded.id] },
  });
};

let cached: ReturnType<typeof createProcessor> | undefined;

const processor = () => (cached ??= createProcessor());

export const UI_EXAMPLES = [
  `Top customers by paid orders, October 2026.

<a2ui>
surface("top-customers")
root = Column([stats, table, actions])
stats = Row([Stat("Revenue", "₮48.2M", "+12%", "good"), Stat("Orders", "312"), Stat("Average order", "₮154K")])
table = Table([{label: "Customer"}, {label: "Revenue", align: "end"}], [["[[ref:k2Xp9aQ0vB7LmN4rT]]", "₮9.4M"], ["[[ref:p8Lm2cV5xQ1nR7sWd]]", "₮7.1M"]])
actions = Row([Button(Text("Email these customers"), "primary", Event("email_top_customers")), Button(Text("Show all 148"), "default", Event("show_all_customers"))])
</a2ui>`,
  `I need two details before I create the task.

<a2ui>
surface("new-task")
$/form/priority = ["normal"]
$/form/assignee = []
$/form/due = ""
root = Card(Column([priority, assignee, due, send]))
priority = ChoicePicker("Priority", "mutuallyExclusive", [{label: "Normal", value: "normal"}, {label: "Urgent", value: "urgent"}], $/form/priority)
assignee = MemberPicker("Assign to", $/form/assignee)
due = DateTimeInput($/form/due, true, false, _, _, "Due date")
send = Button(Text("Create task"), "primary", Event("create_task", {priority: $/form/priority, assignee: $/form/assignee, due: $/form/due}))
</a2ui>`,
];

export const uiFormat = () => processor().promptSnippet;

export const uiProblem = (reply: string) => {
  try {
    processor().parseResponse(reply);

    return null;
  } catch (error) {
    if (error instanceof A2uiError) return error.message;

    throw error;
  }
};
