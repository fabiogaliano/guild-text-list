export const normalizeText = (value) => (value || "").replace(/\s+/g, " ").trim();

export const getGuildName = (elem) => {
  const dnd = elem.closest("[data-dnd-name]");
  const dndName = dnd?.getAttribute("data-dnd-name");
  if (dndName) return normalizeText(dndName);

  const hidden = elem.querySelector('span[class*="hiddenVisually"]');
  return normalizeText(hidden?.textContent);
};

export const isFolderButton = (elem) =>
  typeof elem?.getAttribute === "function" &&
  (elem.getAttribute("aria-owns")?.startsWith("folder-items-") ||
    elem.closest('[class*="folderHeader"]'));

export const extractBgUrl = (style) => {
  if (!style) return "";
  const match = /background-image\s*:\s*url\((['"]?)(.*?)\1\)/i.exec(style);
  return match?.[2] ?? "";
};

export const findGuildIconNode = (elem) => {
  const img = elem.querySelector("img");
  if (img?.src && img.src.includes("/icons/")) {
    const node = img.closest("span") || img;
    return { node, previousDisplay: node.style.display ?? "" };
  }

  const bg = elem.querySelector("[style*='background-image']");
  const url = extractBgUrl(bg?.getAttribute("style"));
  if (bg && url.includes("/icons/")) {
    return { node: bg, previousDisplay: bg.style.display ?? "" };
  }

  return null;
};

export const extractGuildIdFromIconUrl = (url) => {
  if (!url) return null;
  const match = /\/icons\/(\d+)\//.exec(url);
  return match?.[1] ?? null;
};

export const normalizeFolderName = (value) => {
  if (!value) return "";
  const [name] = value.split(",");
  return normalizeText(name);
};

export const getFolderId = (folderButton) => {
  const owns = folderButton?.getAttribute?.("aria-owns");
  if (!owns?.startsWith("folder-items-")) return null;
  return owns.slice("folder-items-".length);
};

export const getFolderIdFromGroup = (folderGroup) => {
  const btn = folderGroup?.querySelector?.(
    '[role="treeitem"][aria-owns^="folder-items-"]',
  );
  const owns = btn?.getAttribute?.("aria-owns");
  if (!owns?.startsWith("folder-items-")) return null;
  return owns.slice("folder-items-".length);
};
