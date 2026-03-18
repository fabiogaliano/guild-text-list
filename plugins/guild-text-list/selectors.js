export const NAV = 'nav[aria-label="Servers sidebar"]';
export const GUILD_SELECTOR = `${NAV} [data-list-item-id^="guildsnav___"]`;
export const FOLDER_SELECTOR = `${NAV} [role="treeitem"][aria-owns^="folder-items-"]`;
export const ROOT_GROUP = `${NAV} [role="group"][aria-label="Servers"]`;

export const HIDDEN_ITEMS = new Set([
  "guild-discover-button",
  "app-download-button",
]);

export const SPECIAL_ITEMS = new Map([
  ["home", "DMs"],
  ["create-join-button", "+ Add Server"],
]);

export const isExcluded = (listItemId) => {
  if (!listItemId) return true;
  const suffix = listItemId.slice("guildsnav___".length);
  if (!suffix) return true;
  if (HIDDEN_ITEMS.has(suffix)) return true;
  if (SPECIAL_ITEMS.has(suffix)) return false;
  return !/^[0-9]+$/.test(suffix);
};
