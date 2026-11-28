/** A plugin name as people read it: `hr` → `HR`, `ecom` → `Ecom`. */
export const pluginLabel = (name: string) =>
  name.length <= 3 ? name.toUpperCase() : name.charAt(0).toUpperCase() + name.slice(1);
