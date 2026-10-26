/**
 * One agent skill a plugin declares in `startPlugin({ meta: { agent } })`.
 *
 * Skills are text only: guidance the core AI assistant loads on demand when a
 * request matches `description`. Core namespaces the name as
 * `<plugin>-<name>` and never runs code or adds tools because of a skill.
 */
export interface IAgentSkillMeta {
  /** Lowercase letters, digits and single hyphens, e.g. `pipeline-analysis`. */
  name: string;
  /** When to use the skill. The model sees this on every turn. */
  description: string;
  /** Markdown guidance, loaded only when the model activates the skill. */
  instructions: string;
  /** Root GraphQL fields (e.g. `salesStages`) the skill relates to. */
  operations?: string[];
}

/**
 * Root GraphQL fields the plugin owns and wants left out of the agent's
 * discovery (schema search and the capabilities catalog). Visibility only:
 * the operations stay executable and resolver permissions still protect them.
 */
export interface IAgentHiddenOperationsMeta {
  queries?: string[];
  mutations?: string[];
}

/** `meta.agent`: what a plugin contributes to the core AI assistant. */
export interface IAgentPluginMeta {
  skills?: IAgentSkillMeta[];
  hiddenOperations?: IAgentHiddenOperationsMeta;
}

/** A declaration core ignored, with the reason it was rejected. */
export interface IAgentPluginMetaRejection {
  skill?: string;
  reason: string;
}

export interface IValidatedAgentPluginMeta {
  skills: IAgentSkillMeta[];
  hiddenOperations: { queries: string[]; mutations: string[] };
  rejections: IAgentPluginMetaRejection[];
}
