(function(exports) {

"use strict";

//#region plugins/guild-text-list/selectors.js
const NAV = "nav[aria-label=\"Servers sidebar\"]";
const GUILD_SELECTOR = `${NAV} [data-list-item-id^="guildsnav___"]`;
const FOLDER_SELECTOR = `${NAV} [role="treeitem"][aria-owns^="folder-items-"]`;
const ROOT_GROUP = `${NAV} [role="group"][aria-label="Servers"]`;
const HIDDEN_ITEMS = new Set(["guild-discover-button", "app-download-button"]);
const SPECIAL_ITEMS = new Map([["home", "DMs"], ["create-join-button", "+ Add Server"]]);
const isExcluded = (listItemId) => {
	if (!listItemId) return true;
	const suffix = listItemId.slice("guildsnav___".length);
	if (!suffix) return true;
	if (HIDDEN_ITEMS.has(suffix)) return true;
	if (SPECIAL_ITEMS.has(suffix)) return false;
	return !/^[0-9]+$/.test(suffix);
};

//#endregion
//#region plugins/guild-text-list/styles.module.css
shelter.plugin.scoped.ui.injectCss(`.rfoGFa_sidebar {
  width: var(--guild-text-w, 200px);
  background: var(--bg-base-secondary, var(--background-secondary, #f2f3f5));
  flex-direction: column;
  min-width: 120px;
  max-width: 360px;
  display: flex;
  position: relative;
}

.rfoGFa_sidebar [class*="folderGroup"] {
  width: 100%;
  background: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
}

.rfoGFa_sidebar [class*="folderGroupBackground"], .rfoGFa_hiddenItem {
  display: none !important;
}

nav[aria-label="Servers sidebar"] div[class*="listItem"]:has([data-list-item-id="guildsnav___guild-discover-button"]), nav[aria-label="Servers sidebar"] div[class*="listItem"]:has([data-list-item-id="guildsnav___app-download-button"]), nav[aria-label="Servers sidebar"] [data-list-item-id="guildsnav___guild-discover-button"], nav[aria-label="Servers sidebar"] [data-list-item-id="guildsnav___app-download-button"] {
  display: none !important;
}

nav[aria-label="Servers sidebar"] .rfoGFa_guildRow[class*="circleIconButton"] {
  width: calc(100% - 16px) !important;
  height: 28px !important;
  color: var(--channels-default, var(--text-normal, #5c5e66)) !important;
  background-color: #0000 !important;
  border-radius: 4px !important;
}

.rfoGFa_addServerBottom {
  background: inherit;
  z-index: 20;
  border-top: 1px solid #0000000f;
  height: 32px;
  position: absolute;
  bottom: 52px;
  left: 0;
  right: 0;
  border-radius: 0 !important;
  width: 100% !important;
  margin: 0 !important;
}

.rfoGFa_resizeHandle {
  cursor: col-resize;
  z-index: 100;
  width: 4px;
  height: 100%;
  position: absolute;
  top: 0;
  right: -2px;
}

.rfoGFa_resizeHandle:after {
  content: "";
  background: var(--brand-500, #5865f2);
  opacity: 0;
  border-radius: 1px;
  width: 2px;
  height: 100%;
  transition: opacity .15s;
  position: absolute;
  top: 0;
  left: 1px;
}

.rfoGFa_resizeHandle:hover:after, .rfoGFa_resizeHandle:active:after {
  opacity: .5;
}

.rfoGFa_guildRow {
  width: calc(100% - 16px);
  color: var(--channels-default, var(--text-normal, #5c5e66));
  cursor: pointer;
  box-sizing: border-box;
  border-radius: 4px;
  align-items: center;
  gap: 8px;
  height: 28px;
  margin: 1px 8px;
  padding: 0 8px;
  transition: background-color .15s;
  display: flex;
  position: relative;
}

.rfoGFa_guildRow:hover {
  color: var(--text-normal, #313338);
  background-color: #0000000a;
}

.rfoGFa_guildRow[aria-selected="true"], .rfoGFa_guildRow[data-is-selected="true"] {
  color: var(--text-normal, #313338);
  box-shadow: inset 3px 0 0 var(--text-normal, #313338);
  background-color: #0000000a;
  font-weight: 600;
}

.rfoGFa_guildRow [class*="pill"] [class*="item"] {
  background-color: currentColor;
}

.rfoGFa_folderRow [class*="pill"] {
  display: none !important;
}

.rfoGFa_guildRow [class*="numberBadge"], .rfoGFa_guildRow [class*="badge"] {
  border-radius: 8px;
  flex-shrink: 0;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
  line-height: 16px;
}

.rfoGFa_guildLabel {
  color: inherit;
  white-space: nowrap;
  text-overflow: ellipsis;
  pointer-events: none;
  cursor: grab;
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 28px;
  overflow: hidden;
}

.rfoGFa_guildLabel:active {
  cursor: grabbing;
}

.rfoGFa_folderRow {
  cursor: pointer;
  background: none;
  border-radius: 0;
  align-self: stretch;
  height: 24px;
  margin-top: 12px;
  margin-bottom: 2px;
  padding: 0 8px;
  width: 100% !important;
}

.rfoGFa_folderRow:hover {
  background: none;
}

.rfoGFa_folderLabel {
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--channels-default, var(--text-muted, #80848e));
  white-space: nowrap;
  text-overflow: ellipsis;
  pointer-events: auto;
  user-select: none;
  cursor: pointer;
  flex: 1;
  align-items: center;
  gap: 0;
  min-width: 0;
  padding: 0;
  font-size: 11px;
  font-weight: 700;
  line-height: 24px;
  transition: color .15s;
  display: inline-flex;
  overflow: hidden;
}

.rfoGFa_folderRow:hover .rfoGFa_folderLabel {
  color: var(--text-normal, #313338);
}

.rfoGFa_folderCaret, .rfoGFa_folderIconHidden {
  display: none;
}

.rfoGFa_folderChildren {
  z-index: 10;
  pointer-events: auto;
  width: 100%;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.rfoGFa_folderChildren .rfoGFa_guildRow {
  width: calc(100% - 16px);
  height: 26px;
  margin: 0 8px;
  padding-left: 16px;
  animation: .18s cubic-bezier(.25, 1, .5, 1) both rfoGFa_slideIn;
}

.rfoGFa_folderChildren .rfoGFa_guildRow:first-child {
  animation-delay: 0s;
}

.rfoGFa_folderChildren .rfoGFa_guildRow:nth-child(2) {
  animation-delay: 20ms;
}

.rfoGFa_folderChildren .rfoGFa_guildRow:nth-child(3) {
  animation-delay: 35ms;
}

.rfoGFa_folderChildren .rfoGFa_guildRow:nth-child(4) {
  animation-delay: 45ms;
}

.rfoGFa_folderChildren .rfoGFa_guildRow:nth-child(n+5) {
  animation-delay: 50ms;
}

@keyframes rfoGFa_slideIn {
  from {
    opacity: 0;
    transform: translateY(-3px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rfoGFa_folderDot {
  display: none;
}

.rfoGFa_folderItemsHidden, .rfoGFa_folderHeaderHidden, .rfoGFa_folderButtonHidden {
  opacity: 0 !important;
  pointer-events: none !important;
  width: 0 !important;
  height: 0 !important;
  position: absolute !important;
  overflow: hidden !important;
}

.rfoGFa_folderBgHidden, .rfoGFa_folderOpenWrapperHidden {
  pointer-events: none;
}

.rfoGFa_separator {
  box-sizing: border-box;
  cursor: grab;
  width: calc(100% - 24px);
  margin: 4px 12px;
  padding: 0;
}

.rfoGFa_separator:active {
  cursor: grabbing;
}

.rfoGFa_separatorLine {
  background: #00000014;
  width: 100%;
  height: 1px;
}

.rfoGFa_rootMenu {
  z-index: 999999;
  background: var(--background-floating, #fff);
  min-width: 180px;
  color: var(--text-normal, #313338);
  transform-origin: 0 0;
  border: .5px solid #00000014;
  border-radius: 6px;
  padding: 4px;
  font-size: 13px;
  animation: .125s cubic-bezier(.25, 1, .5, 1) rfoGFa_menuIn;
  position: fixed;
  box-shadow: 0 0 0 .5px #0000000d, 0 2px 4px #0000000a, 0 4px 12px #00000014;
}

@keyframes rfoGFa_menuIn {
  from {
    opacity: 0;
    transform: scale(.96);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.rfoGFa_rootMenuButton {
  appearance: none;
  text-align: left;
  width: 100%;
  color: inherit;
  cursor: pointer;
  background: none;
  border: 0;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 13px;
  transition: background-color .1s;
  display: block;
}

.rfoGFa_rootMenuButton:hover {
  background-color: #0000000f;
}

@media (prefers-reduced-motion: reduce) {
  .rfoGFa_guildRow, .rfoGFa_folderCaret, .rfoGFa_folderLabel, .rfoGFa_rootMenu, .rfoGFa_rootMenuButton, .rfoGFa_resizeHandle:after {
    transition: none;
    animation: none;
  }

  .rfoGFa_folderChildren .rfoGFa_guildRow {
    animation: none;
  }
}
`);
var styles_module_default = {
	"folderItemsHidden": "rfoGFa_folderItemsHidden",
	"resizeHandle": "rfoGFa_resizeHandle",
	"folderHeaderHidden": "rfoGFa_folderHeaderHidden",
	"guildLabel": "rfoGFa_guildLabel",
	"folderBgHidden": "rfoGFa_folderBgHidden",
	"folderIconHidden": "rfoGFa_folderIconHidden",
	"folderChildren": "rfoGFa_folderChildren",
	"sidebar": "rfoGFa_sidebar",
	"separatorLine": "rfoGFa_separatorLine",
	"folderRow": "rfoGFa_folderRow",
	"guildRow": "rfoGFa_guildRow",
	"menuIn": "rfoGFa_menuIn",
	"slideIn": "rfoGFa_slideIn",
	"rootMenuButton": "rfoGFa_rootMenuButton",
	"rootMenu": "rfoGFa_rootMenu",
	"folderOpenWrapperHidden": "rfoGFa_folderOpenWrapperHidden",
	"hiddenItem": "rfoGFa_hiddenItem",
	"folderLabel": "rfoGFa_folderLabel",
	"separator": "rfoGFa_separator",
	"folderDot": "rfoGFa_folderDot",
	"folderButtonHidden": "rfoGFa_folderButtonHidden",
	"addServerBottom": "rfoGFa_addServerBottom",
	"folderCaret": "rfoGFa_folderCaret"
};

//#endregion
//#region plugins/guild-text-list/dom-utils.js
const normalizeText = (value) => (value || "").replace(/\s+/g, " ").trim();
const getGuildName = (elem) => {
	const dnd = elem.closest("[data-dnd-name]");
	const dndName = dnd?.getAttribute("data-dnd-name");
	if (dndName) return normalizeText(dndName);
	const hidden = elem.querySelector("span[class*=\"hiddenVisually\"]");
	return normalizeText(hidden?.textContent);
};
const isFolderButton = (elem) => typeof elem?.getAttribute === "function" && (elem.getAttribute("aria-owns")?.startsWith("folder-items-") || elem.closest("[class*=\"folderHeader\"]"));
const extractBgUrl = (style) => {
	if (!style) return "";
	const match = /background-image\s*:\s*url\((['"]?)(.*?)\1\)/i.exec(style);
	return match?.[2] ?? "";
};
const findGuildIconNode = (elem) => {
	const img = elem.querySelector("img");
	if (img?.src && img.src.includes("/icons/")) {
		const node = img.closest("span") || img;
		return {
			node,
			previousDisplay: node.style.display ?? ""
		};
	}
	const bg = elem.querySelector("[style*='background-image']");
	const url = extractBgUrl(bg?.getAttribute("style"));
	if (bg && url.includes("/icons/")) return {
		node: bg,
		previousDisplay: bg.style.display ?? ""
	};
	return null;
};
const normalizeFolderName = (value) => {
	if (!value) return "";
	const [name] = value.split(",");
	return normalizeText(name);
};
const getFolderId = (folderButton) => {
	const owns = folderButton?.getAttribute?.("aria-owns");
	if (!owns?.startsWith("folder-items-")) return null;
	return owns.slice("folder-items-".length);
};
const getFolderIdFromGroup = (folderGroup) => {
	const btn = folderGroup?.querySelector?.("[role=\"treeitem\"][aria-owns^=\"folder-items-\"]");
	const owns = btn?.getAttribute?.("aria-owns");
	if (!owns?.startsWith("folder-items-")) return null;
	return owns.slice("folder-items-".length);
};

//#endregion
//#region plugins/guild-text-list/textify.js
const processed = new Map();
const processedFolders = new Map();
const syncFolderSelection = () => {
	const selectedId = shelter?.flux?.storesFlat?.SelectedGuildStore?.getGuildId?.();
	for (const row of document.querySelectorAll(`.${styles_module_default.folderChildren} [data-guild-id]`)) if (row.getAttribute("data-guild-id") === selectedId) row.setAttribute("data-is-selected", "true");
else row.removeAttribute("data-is-selected");
};
const ensureFolderChildren = (folderGroup) => {
	let container = folderGroup.querySelector(`.${styles_module_default.folderChildren}`);
	if (!container) {
		container = document.createElement("div");
		container.className = styles_module_default.folderChildren;
		folderGroup.append(container);
	}
	return container;
};
const clearFolderChildren = (folderGroup) => {
	const container = folderGroup.querySelector(`.${styles_module_default.folderChildren}`);
	if (container) container.remove();
};
const getFolderGuildsFromDom = (folderGroup, folderId) => {
	const root = folderGroup.querySelector(`#folder-items-${folderId}`);
	if (!root) return [];
	const guilds = [];
	const seen = new Set();
	for (const treeitem of root.querySelectorAll("[data-list-item-id^=\"guildsnav___\"]")) {
		const listItemId = treeitem.getAttribute("data-list-item-id");
		const guildId = listItemId?.slice("guildsnav___".length);
		if (!guildId || !/^[0-9]+$/.test(guildId) || seen.has(guildId)) continue;
		seen.add(guildId);
		const dnd = treeitem.closest("[data-dnd-name]");
		const name = normalizeText(dnd?.getAttribute?.("data-dnd-name"));
		guilds.push({
			id: guildId,
			name
		});
	}
	return guilds;
};
const renderFolderChildren = (folderGroup, folderId, GuildStore$1) => {
	const origItems = folderGroup.querySelector(`#folder-items-${folderId}`);
	if (origItems) origItems.classList.add(styles_module_default.folderItemsHidden);
	const bg = folderGroup.querySelector("[class*=\"folderGroupBackground\"]");
	if (bg) bg.classList.add(styles_module_default.folderBgHidden);
	for (const w of folderGroup.querySelectorAll("[class*=\"wrapper_\"], [class*=\"folderEndWrapper\"]")) w.classList.add(styles_module_default.folderBgHidden);
	const container = ensureFolderChildren(folderGroup);
	container.replaceChildren();
	const guilds = getFolderGuildsFromDom(folderGroup, folderId);
	for (const { id: gid, name: domName } of guilds) {
		const name = GuildStore$1?.getGuild?.(gid)?.name || domName || gid;
		const row = document.createElement("div");
		row.className = styles_module_default.guildRow;
		row.setAttribute("role", "button");
		row.setAttribute("tabindex", "-1");
		row.setAttribute("data-guild-id", gid);
		row.style.cursor = "pointer";
		const selectedGuildId = GuildStore$1 && shelter?.flux?.storesFlat?.SelectedGuildStore?.getGuildId?.();
		if (selectedGuildId === gid) row.setAttribute("data-is-selected", "true");
		const dot = document.createElement("span");
		dot.className = styles_module_default.folderDot;
		row.append(dot);
		const label = document.createElement("div");
		label.className = styles_module_default.guildLabel;
		label.textContent = name;
		label.setAttribute("title", name);
		row.append(label);
		row.addEventListener("click", (event) => {
			event.preventDefault();
			event.stopPropagation();
			for (const r of container.querySelectorAll("[data-is-selected]")) r.removeAttribute("data-is-selected");
			row.setAttribute("data-is-selected", "true");
			const target = folderGroup.querySelector(`[data-list-item-id='guildsnav___${gid}']`) || document.querySelector(`[data-list-item-id='guildsnav___${gid}']`);
			if (target instanceof HTMLElement) target.click();
		}, true);
		container.append(row);
	}
};
const textifyGuild = (elem) => {
	if (!(elem instanceof HTMLElement)) return;
	if (isFolderButton(elem)) return;
	const listItemId = elem.getAttribute("data-list-item-id");
	const suffix = listItemId?.slice("guildsnav___".length) ?? "";
	if (HIDDEN_ITEMS.has(suffix)) {
		const listItem$1 = elem.closest("div[class*=\"listItem\"]") || elem;
		listItem$1.classList.add(styles_module_default.hiddenItem);
		return;
	}
	if (isExcluded(listItemId)) return;
	const isSpecial = SPECIAL_ITEMS.has(suffix);
	const icon = findGuildIconNode(elem);
	if (!isSpecial && !icon?.node) return;
	const name = isSpecial ? SPECIAL_ITEMS.get(suffix) : getGuildName(elem);
	if (!name) return;
	const listItemWrap = elem.closest("div[class*=\"listItem\"]");
	const listItem = listItemWrap || elem;
	if (!listItem.classList.contains(styles_module_default.guildRow)) listItem.classList.add(styles_module_default.guildRow);
	if (isSpecial && !listItemWrap) {
		for (const child of Array.from(elem.children)) if (!child.classList.contains(styles_module_default.guildLabel)) child.style.display = "none";
	}
	if (suffix === "create-join-button") {
		listItem.classList.add(styles_module_default.hiddenItem);
		const nav = elem.closest("nav[aria-label=\"Servers sidebar\"]");
		if (nav && !nav.querySelector(`.${styles_module_default.addServerBottom}`)) {
			const bottomBtn = document.createElement("div");
			bottomBtn.className = `${styles_module_default.guildRow} ${styles_module_default.addServerBottom}`;
			bottomBtn.setAttribute("role", "button");
			bottomBtn.style.cursor = "pointer";
			const btnLabel = document.createElement("div");
			btnLabel.className = styles_module_default.guildLabel;
			btnLabel.textContent = name;
			bottomBtn.append(btnLabel);
			bottomBtn.addEventListener("click", () => elem.click());
			nav.append(bottomBtn);
		}
		return;
	}
	let label = listItem.querySelector(`.${styles_module_default.guildLabel}`);
	if (!label) {
		label = document.createElement("div");
		label.className = styles_module_default.guildLabel;
		listItem.append(label);
	}
	label.textContent = name;
	label.setAttribute("title", name);
	if (!processed.has(listItem)) {
		let iconNode = icon?.node;
		if (!iconNode && listItemWrap) {
			const wrapper = elem.querySelector("[class*=\"childWrapper\"], [class*=\"listItemWrapper\"]");
			if (wrapper) iconNode = wrapper;
else iconNode = elem.querySelector("svg:not([class*=\"badge\"])");
		}
		const previousDisplay = iconNode?.style?.display ?? "";
		if (iconNode) iconNode.style.display = "none";
		const handleClick = isSpecial && !listItemWrap ? null : (event) => {
			if (event.defaultPrevented) return;
			if (event.target instanceof Node && elem.contains(event.target)) return;
			elem.click();
		};
		const handleContextMenu = (event) => {
			if (event.defaultPrevented) return;
			if (event.target instanceof Node && elem.contains(event.target)) return;
			event.preventDefault();
			event.stopPropagation();
			elem.dispatchEvent(new MouseEvent("contextmenu", {
				bubbles: true,
				cancelable: true,
				view: window,
				clientX: event.clientX,
				clientY: event.clientY,
				screenX: event.screenX,
				screenY: event.screenY
			}));
		};
		if (handleClick) listItem.addEventListener("click", handleClick);
		listItem.addEventListener("contextmenu", handleContextMenu);
		processed.set(listItem, {
			iconNode,
			previousDisplay,
			isSpecialNoWrap: isSpecial && !listItemWrap,
			handleClick,
			handleContextMenu
		});
	}
};
const textifyFolder = (elem, { observeDom: observeDom$1, GuildStore: GuildStore$1 }) => {
	if (!(elem instanceof HTMLElement)) return;
	const header = elem.closest("[data-dnd-name]");
	const dndName = header?.getAttribute("data-dnd-name");
	const hidden = elem.querySelector("span[class*=\"hiddenVisually\"]");
	const name = normalizeText(dndName || normalizeFolderName(hidden?.textContent));
	if (!name) return;
	const listItem = elem.closest("div[class*=\"listItem\"]") || elem;
	const folderGroup = elem.closest("[class*=\"folderGroup\"]");
	const folderId = getFolderId(elem);
	if (!folderGroup || !folderId) return;
	if (!listItem.classList.contains(styles_module_default.folderRow)) listItem.classList.add(styles_module_default.folderRow);
	if (!listItem.classList.contains(styles_module_default.guildRow)) listItem.classList.add(styles_module_default.guildRow);
	elem.classList.add(styles_module_default.folderButtonHidden);
	const expanded = elem.getAttribute("aria-expanded");
	if (expanded === "true") listItem.classList.add(styles_module_default.folderExpanded);
else listItem.classList.remove(styles_module_default.folderExpanded);
	let label = listItem.querySelector(`.${styles_module_default.folderLabel}`);
	if (!label) {
		label = document.createElement("div");
		label.className = `${styles_module_default.guildLabel} ${styles_module_default.folderLabel}`;
		const caret = document.createElement("span");
		caret.className = styles_module_default.folderCaret;
		caret.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
		label.append(caret);
		const text = document.createElement("span");
		text.className = "shelter-folder-text";
		label.append(text);
		listItem.append(label);
	}
	const textNode = label.querySelector(".shelter-folder-text");
	if (textNode) textNode.textContent = name;
	label.setAttribute("title", name);
	if (!processedFolders.has(listItem)) {
		if (header) header.classList.add(styles_module_default.folderHeaderHidden);
		const iconWrap = elem.querySelector("[aria-hidden=\"true\"]");
		const previousDisplay = iconWrap?.style.display ?? "";
		if (iconWrap) {
			iconWrap.classList.add(styles_module_default.folderIconHidden);
			iconWrap.style.display = "none";
		}
		const handleToggle = (event) => {
			if (event.defaultPrevented) return;
			if (event.target instanceof Node && elem.contains(event.target)) return;
			event.preventDefault();
			event.stopPropagation();
			elem.click();
			const syncExpanded = () => {
				const isExpanded = elem.getAttribute("aria-expanded") === "true";
				if (isExpanded) listItem.classList.add(styles_module_default.folderExpanded);
else listItem.classList.remove(styles_module_default.folderExpanded);
				if (!isExpanded) {
					clearFolderChildren(folderGroup);
					return;
				}
				const render = () => renderFolderChildren(folderGroup, folderId, GuildStore$1);
				render();
				const unobs = observeDom$1(`#folder-items-${folderId} *`, () => {
					unobs();
					render();
				});
				setTimeout(unobs, 250);
			};
			queueMicrotask(syncExpanded);
			setTimeout(syncExpanded, 50);
		};
		listItem.addEventListener("click", handleToggle, true);
		processedFolders.set(listItem, {
			iconWrap,
			previousDisplay,
			handleToggle,
			label,
			elem,
			folderGroup
		});
	}
};
const cleanupGuilds = () => {
	for (const [listItem, data] of processed) {
		const label = listItem.querySelector(`.${styles_module_default.guildLabel}`);
		if (label) label.remove();
		if (data?.iconNode) data.iconNode.style.display = data.previousDisplay;
		if (data?.isSpecialNoWrap) {
			for (const child of Array.from(listItem.children)) if (child.style.display === "none") child.style.display = "";
		}
		if (data?.handleClick) listItem.removeEventListener("click", data.handleClick);
		if (data?.handleContextMenu) listItem.removeEventListener("contextmenu", data.handleContextMenu);
		listItem.classList.remove(styles_module_default.guildRow);
		listItem.classList.remove(styles_module_default.hiddenItem);
	}
	processed.clear();
	for (const btn of document.querySelectorAll(`.${styles_module_default.addServerBottom}`)) btn.remove();
};
const cleanupFolders = () => {
	for (const [listItem, data] of processedFolders) {
		const label = listItem.querySelector(`.${styles_module_default.folderLabel}`);
		if (label) label.remove();
		if (data?.iconWrap) {
			data.iconWrap.style.display = data.previousDisplay;
			data.iconWrap.classList.remove(styles_module_default.folderIconHidden);
		}
		if (data?.handleToggle) listItem.removeEventListener("click", data.handleToggle, true);
		if (data?.elem) data.elem.classList.remove(styles_module_default.folderButtonHidden);
		if (data?.folderGroup) {
			clearFolderChildren(data.folderGroup);
			if (data?.elem?.getAttribute?.("aria-expanded") === "true") data.elem.click();
		}
		listItem.classList.remove(styles_module_default.folderRow, styles_module_default.guildRow, styles_module_default.folderExpanded);
	}
	processedFolders.clear();
};

//#endregion
//#region plugins/guild-text-list/context-menu.js
let rootMenu = null;
let rootMenuCleanup = null;
const closeRootMenu = () => {
	rootMenuCleanup?.();
	rootMenuCleanup = null;
	rootMenu?.remove();
	rootMenu = null;
};
const openRootMenu = (x, y, items) => {
	closeRootMenu();
	const menu = document.createElement("div");
	menu.className = styles_module_default.rootMenu;
	for (const item of items) {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = styles_module_default.rootMenuButton;
		btn.textContent = item.label;
		btn.addEventListener("click", () => {
			item.onClick();
			closeRootMenu();
		});
		menu.append(btn);
	}
	menu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - 220))}px`;
	menu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - 200))}px`;
	document.body.append(menu);
	rootMenu = menu;
	const onDocDown = (ev) => {
		if (!(ev.target instanceof Node) || !menu.contains(ev.target)) closeRootMenu();
	};
	const onKey = (ev) => {
		if (ev.key === "Escape") closeRootMenu();
	};
	const cleanup = () => {
		document.removeEventListener("pointerdown", onDocDown, true);
		window.removeEventListener("keydown", onKey, true);
	};
	rootMenuCleanup = cleanup;
	setTimeout(() => {
		document.addEventListener("pointerdown", onDocDown, true);
		window.addEventListener("keydown", onKey, true);
	}, 0);
};

//#endregion
//#region plugins/guild-text-list/reorder.js
let rootContainer = null;
let isDragging$1 = false;
let dragNode = null;
let dragStart = null;
let didDrag = false;
let activePointerId = null;
let rafPending = false;
let isApplyingOrder = false;
let lastApplyAt = 0;
const getRootContainer = () => {
	rootContainer = document.querySelector(ROOT_GROUP);
	return rootContainer;
};
const newSepId = () => {
	if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
const createSeparator = (id) => {
	const el = document.createElement("div");
	el.className = styles_module_default.separator;
	el.setAttribute("data-shelter-separator-id", id);
	const line = document.createElement("div");
	line.className = styles_module_default.separatorLine;
	el.append(line);
	return el;
};
const ensureSeparatorExists = (id) => {
	rootContainer = rootContainer || getRootContainer();
	if (!(rootContainer instanceof HTMLElement)) return null;
	const existing = Array.from(rootContainer.querySelectorAll(`.${styles_module_default.separator}`)).find((el$1) => el$1.getAttribute("data-shelter-separator-id") === id);
	if (existing) return existing;
	const el = createSeparator(id);
	rootContainer.append(el);
	return el;
};
const getKeyForRootChild = (node) => {
	if (!(node instanceof HTMLElement)) return null;
	if (node.classList.contains(styles_module_default.separator)) {
		const id = node.getAttribute("data-shelter-separator-id");
		return id ? `s:${id}` : null;
	}
	if (node.matches("[class*=\"folderGroup\"]")) {
		const folderId = getFolderIdFromGroup(node);
		return folderId ? `f:${folderId}` : null;
	}
	if (node.matches("div[class*=\"listItem\"]")) {
		const treeitem = node.querySelector("[role=\"treeitem\"][data-list-item-id^=\"guildsnav___\"]");
		const listItemId = treeitem?.getAttribute?.("data-list-item-id");
		if (!listItemId) return null;
		if (isExcluded(listItemId)) return null;
		const suffix = listItemId.slice("guildsnav___".length);
		if (!/^[0-9]+$/.test(suffix)) return null;
		return `g:${suffix}`;
	}
	return null;
};
const saveRootOrder = (store$1) => {
	rootContainer = rootContainer || getRootContainer();
	if (!(rootContainer instanceof HTMLElement)) return;
	const keys = [];
	for (const child of Array.from(rootContainer.children)) {
		const key = getKeyForRootChild(child);
		if (key) keys.push(key);
	}
	store$1.rootOrderV1 = keys;
	store$1.rootOrderV1SavedAt = Date.now();
	store$1.rootOrderV1SaveCount = (store$1.rootOrderV1SaveCount || 0) + 1;
};
const applyStoredRootOrder = (store$1) => {
	if (isDragging$1) return;
	if (isApplyingOrder) return;
	const now = Date.now();
	if (now - lastApplyAt < 50) return;
	rootContainer = rootContainer || getRootContainer();
	if (!(rootContainer instanceof HTMLElement)) return;
	isApplyingOrder = true;
	lastApplyAt = now;
	const raw = store$1.rootOrderV1;
	const desired = [];
	if (raw && typeof raw.length === "number") for (let i = 0; i < raw.length; i++) desired.push(raw[i]);
	const desiredSet = new Set(desired);
	const children = Array.from(rootContainer.children);
	const byKey = new Map();
	const unknown = [];
	for (const child of children) {
		const key = getKeyForRootChild(child);
		if (!key) continue;
		if (!byKey.has(key)) byKey.set(key, child);
	}
	for (const key of desired) {
		if (typeof key !== "string") continue;
		if (key.startsWith("s:")) {
			const sep = ensureSeparatorExists(key.slice(2));
			if (sep) rootContainer.append(sep);
			continue;
		}
		const el = byKey.get(key);
		if (el) rootContainer.append(el);
	}
	for (const child of children) {
		const key = getKeyForRootChild(child);
		if (!key) continue;
		if (!desiredSet.has(key)) unknown.push(child);
	}
	for (const el of unknown) rootContainer.append(el);
	queueMicrotask(() => {
		isApplyingOrder = false;
	});
};
const getRootDraggableNode = (target) => {
	rootContainer = rootContainer || getRootContainer();
	if (!(rootContainer instanceof HTMLElement)) return null;
	if (!(target instanceof HTMLElement)) return null;
	if (target.closest(`.${styles_module_default.folderChildren}`)) return null;
	const sep = target.closest(`.${styles_module_default.separator}`);
	if (sep && sep.parentElement === rootContainer) return sep;
	const folderGroup = target.closest("[class*=\"folderGroup\"]");
	if (folderGroup && folderGroup.parentElement === rootContainer) return folderGroup;
	const listItem = target.closest("div[class*=\"listItem\"]");
	if (listItem && listItem.parentElement === rootContainer) return listItem;
	return null;
};
const reorderOnPointer = (clientY) => {
	if (!(rootContainer instanceof HTMLElement)) return;
	if (!(dragNode instanceof HTMLElement)) return;
	const over = document.elementFromPoint(8, clientY);
	const overNode = getRootDraggableNode(over);
	if (!overNode || overNode === dragNode) return;
	if (overNode.parentElement !== rootContainer) return;
	const rect = overNode.getBoundingClientRect();
	const before = clientY < rect.top + rect.height / 2;
	if (before) rootContainer.insertBefore(dragNode, overNode);
else rootContainer.insertBefore(dragNode, overNode.nextSibling);
};
const setupDragAndContextMenu = (store$1) => {
	const onPointerDown = (event) => {
		if (event.button !== 0) return;
		const node = getRootDraggableNode(event.target);
		if (!node) return;
		isDragging$1 = true;
		didDrag = false;
		dragNode = node;
		dragStart = {
			x: event.clientX,
			y: event.clientY
		};
		activePointerId = event.pointerId;
	};
	const onPointerMove = (event) => {
		if (!isDragging$1) return;
		if (activePointerId !== null && event.pointerId !== activePointerId) return;
		if (!dragStart) return;
		const dx = Math.abs(event.clientX - dragStart.x);
		const dy = Math.abs(event.clientY - dragStart.y);
		if (!didDrag && dx + dy < 6) return;
		didDrag = true;
		if (dragNode instanceof HTMLElement) {
			dragNode.style.opacity = "0.7";
			dragNode.style.userSelect = "none";
		}
		if (rafPending) return;
		rafPending = true;
		requestAnimationFrame(() => {
			rafPending = false;
			reorderOnPointer(event.clientY);
		});
	};
	const endDrag = () => {
		if (!isDragging$1) return;
		if (dragNode instanceof HTMLElement) {
			dragNode.style.opacity = "";
			dragNode.style.userSelect = "";
		}
		if (didDrag) saveRootOrder(store$1);
		isDragging$1 = false;
		dragNode = null;
		dragStart = null;
		didDrag = false;
		activePointerId = null;
	};
	const onContextMenu = (event) => {
		if (!event.shiftKey) return;
		const node = getRootDraggableNode(event.target);
		if (!node) return;
		event.preventDefault();
		event.stopPropagation();
		const key = getKeyForRootChild(node);
		if (!key) return;
		if (key.startsWith("s:")) {
			openRootMenu(event.clientX, event.clientY, [{
				label: "Remove separator",
				onClick: () => {
					node.remove();
					saveRootOrder(store$1);
				}
			}]);
			return;
		}
		openRootMenu(event.clientX, event.clientY, [{
			label: "Insert separator above",
			onClick: () => {
				const id = newSepId();
				const sep = createSeparator(id);
				rootContainer = rootContainer || getRootContainer();
				if (rootContainer) rootContainer.insertBefore(sep, node);
				saveRootOrder(store$1);
			}
		}, {
			label: "Insert separator below",
			onClick: () => {
				const id = newSepId();
				const sep = createSeparator(id);
				rootContainer = rootContainer || getRootContainer();
				if (rootContainer) rootContainer.insertBefore(sep, node.nextSibling);
				saveRootOrder(store$1);
			}
		}]);
	};
	window.addEventListener("pointerdown", onPointerDown, true);
	window.addEventListener("pointermove", onPointerMove, true);
	window.addEventListener("pointerup", endDrag, true);
	window.addEventListener("pointercancel", endDrag, true);
	window.addEventListener("contextmenu", onContextMenu, true);
	return () => {
		closeRootMenu();
		window.removeEventListener("pointerdown", onPointerDown, true);
		window.removeEventListener("pointermove", onPointerMove, true);
		window.removeEventListener("pointerup", endDrag, true);
		window.removeEventListener("pointercancel", endDrag, true);
		window.removeEventListener("contextmenu", onContextMenu, true);
	};
};

//#endregion
//#region plugins/guild-text-list/resize.js
let handle = null;
let isDragging = false;
const setupResize = (store$1) => {
	const nav = document.querySelector(NAV);
	if (!nav) return () => {};
	const saved = store$1.sidebarWidth;
	if (saved && typeof saved === "number") nav.style.setProperty("--guild-text-w", `${saved}px`);
	nav.classList.add(styles_module_default.sidebar);
	handle = document.createElement("div");
	handle.className = styles_module_default.resizeHandle;
	nav.append(handle);
	let startX = 0;
	let startW = 0;
	const onPointerDown = (e) => {
		if (e.button !== 0) return;
		e.preventDefault();
		e.stopPropagation();
		isDragging = true;
		startX = e.clientX;
		startW = nav.getBoundingClientRect().width;
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	};
	const onPointerMove = (e) => {
		if (!isDragging) return;
		const delta = e.clientX - startX;
		const newW = Math.max(120, Math.min(360, startW + delta));
		nav.style.setProperty("--guild-text-w", `${newW}px`);
	};
	const onPointerUp = () => {
		if (!isDragging) return;
		isDragging = false;
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
		const finalW = nav.getBoundingClientRect().width;
		store$1.sidebarWidth = Math.round(finalW);
	};
	handle.addEventListener("pointerdown", onPointerDown);
	window.addEventListener("pointermove", onPointerMove);
	window.addEventListener("pointerup", onPointerUp);
	window.addEventListener("pointercancel", onPointerUp);
	return () => {
		handle.removeEventListener("pointerdown", onPointerDown);
		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("pointerup", onPointerUp);
		window.removeEventListener("pointercancel", onPointerUp);
		handle.remove();
		handle = null;
		nav.classList.remove(styles_module_default.sidebar);
		nav.style.removeProperty("--guild-text-w");
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
	};
};

//#endregion
//#region plugins/guild-text-list/index.js
const { plugin, flux } = shelter;
const { observeDom } = plugin.scoped;
const { GuildStore } = flux.storesFlat;
const { store } = plugin;
store.rootOrderV1 ??= [];
const folderCtx = {
	observeDom,
	GuildStore
};
const scanAll = () => {
	for (const elem of document.querySelectorAll(GUILD_SELECTOR)) textifyGuild(elem);
	for (const elem of document.querySelectorAll(FOLDER_SELECTOR)) textifyFolder(elem, folderCtx);
	applyStoredRootOrder(store);
};
const observeOnce = () => {
	let scheduled = false;
	const unobserve = observeDom(`${GUILD_SELECTOR}, ${FOLDER_SELECTOR}`, (elem) => {
		textifyGuild(elem);
		textifyFolder(elem, folderCtx);
		unobserve();
		if (!scheduled) {
			scheduled = true;
			queueMicrotask(() => {
				scheduled = false;
				applyStoredRootOrder(store);
			});
		}
	});
	setTimeout(unobserve, 500);
};
const applyRootOrderWhenReady = () => {
	const unobs = observeDom(ROOT_GROUP, () => {
		unobs();
		queueMicrotask(() => applyStoredRootOrder(store));
	});
	setTimeout(unobs, 1500);
};
let teardownDrag = null;
let teardownResize = null;
function onLoad() {
	scanAll();
	observeOnce();
	applyRootOrderWhenReady();
	teardownDrag = setupDragAndContextMenu(store);
	teardownResize = setupResize(store);
	const triggers = [
		"GUILD_CREATE",
		"GUILD_DELETE",
		"GUILD_UPDATE"
	];
	for (const t of triggers) plugin.scoped.flux.subscribe(t, observeOnce);
	plugin.scoped.flux.subscribe("CHANNEL_SELECT", () => {
		observeOnce();
		queueMicrotask(syncFolderSelection);
	});
}
function onUnload() {
	teardownDrag?.();
	teardownDrag = null;
	teardownResize?.();
	teardownResize = null;
	cleanupGuilds();
	cleanupFolders();
}

//#endregion
exports.onLoad = onLoad
exports.onUnload = onUnload
return exports;
})({});