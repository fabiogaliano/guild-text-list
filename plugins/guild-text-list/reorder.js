import styles from "./styles.module.css";
import { isExcluded, ROOT_GROUP } from "./selectors.js";
import { getFolderIdFromGroup } from "./dom-utils.js";
import { openRootMenu, closeRootMenu } from "./context-menu.js";

let rootContainer = null;
let isDragging = false;
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
  el.className = styles.separator;
  el.setAttribute("data-shelter-separator-id", id);

  const line = document.createElement("div");
  line.className = styles.separatorLine;
  el.append(line);

  return el;
};

const ensureSeparatorExists = (id) => {
  rootContainer = rootContainer || getRootContainer();
  if (!(rootContainer instanceof HTMLElement)) return null;

  const existing = Array.from(
    rootContainer.querySelectorAll(`.${styles.separator}`),
  ).find((el) => el.getAttribute("data-shelter-separator-id") === id);
  if (existing) return existing;

  const el = createSeparator(id);
  rootContainer.append(el);
  return el;
};

export const getKeyForRootChild = (node) => {
  if (!(node instanceof HTMLElement)) return null;

  if (node.classList.contains(styles.separator)) {
    const id = node.getAttribute("data-shelter-separator-id");
    return id ? `s:${id}` : null;
  }

  if (node.matches('[class*="folderGroup"]')) {
    const folderId = getFolderIdFromGroup(node);
    return folderId ? `f:${folderId}` : null;
  }

  if (node.matches('div[class*="listItem"]')) {
    const treeitem = node.querySelector(
      '[role="treeitem"][data-list-item-id^="guildsnav___"]',
    );
    const listItemId = treeitem?.getAttribute?.("data-list-item-id");
    if (!listItemId) return null;
    if (isExcluded(listItemId)) return null;
    const suffix = listItemId.slice("guildsnav___".length);
    if (!/^[0-9]+$/.test(suffix)) return null;
    return `g:${suffix}`;
  }

  return null;
};

export const saveRootOrder = (store) => {
  rootContainer = rootContainer || getRootContainer();
  if (!(rootContainer instanceof HTMLElement)) return;

  const keys = [];
  for (const child of Array.from(rootContainer.children)) {
    const key = getKeyForRootChild(child);
    if (key) keys.push(key);
  }
  store.rootOrderV1 = keys;
  store.rootOrderV1SavedAt = Date.now();
  store.rootOrderV1SaveCount = (store.rootOrderV1SaveCount || 0) + 1;
};

export const applyStoredRootOrder = (store) => {
  if (isDragging) return;
  if (isApplyingOrder) return;
  const now = Date.now();
  if (now - lastApplyAt < 50) return;
  rootContainer = rootContainer || getRootContainer();
  if (!(rootContainer instanceof HTMLElement)) return;

  isApplyingOrder = true;
  lastApplyAt = now;

  // shelter store is a Solid proxy — reading can throw if data is corrupted
  let desired = [];
  try {
    const raw = store.rootOrderV1;
    if (raw && typeof raw.length === "number") {
      for (let i = 0; i < raw.length; i++) desired.push(raw[i]);
    }
  } catch {
    // corrupted store data from previous plugin version — reset it
    store.rootOrderV1 = [];
    desired = [];
  }
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

  if (target.closest(`.${styles.folderChildren}`)) return null;

  const sep = target.closest(`.${styles.separator}`);
  if (sep && sep.parentElement === rootContainer) return sep;

  const folderGroup = target.closest('[class*="folderGroup"]');
  if (folderGroup && folderGroup.parentElement === rootContainer) return folderGroup;

  const listItem = target.closest('div[class*="listItem"]');
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
  if (before) {
    rootContainer.insertBefore(dragNode, overNode);
  } else {
    rootContainer.insertBefore(dragNode, overNode.nextSibling);
  }
};

export const setupDragAndContextMenu = (store) => {
  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    const node = getRootDraggableNode(event.target);
    if (!node) return;

    isDragging = true;
    didDrag = false;
    dragNode = node;
    dragStart = { x: event.clientX, y: event.clientY };
    activePointerId = event.pointerId;
  };

  const onPointerMove = (event) => {
    if (!isDragging) return;
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
    if (!isDragging) return;
    if (dragNode instanceof HTMLElement) {
      dragNode.style.opacity = "";
      dragNode.style.userSelect = "";
    }
    if (didDrag) saveRootOrder(store);

    isDragging = false;
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
      openRootMenu(event.clientX, event.clientY, [
        {
          label: "Remove separator",
          onClick: () => {
            node.remove();
            saveRootOrder(store);
          },
        },
      ]);
      return;
    }

    openRootMenu(event.clientX, event.clientY, [
      {
        label: "Insert separator above",
        onClick: () => {
          const id = newSepId();
          const sep = createSeparator(id);
          rootContainer = rootContainer || getRootContainer();
          if (rootContainer) rootContainer.insertBefore(sep, node);
          saveRootOrder(store);
        },
      },
      {
        label: "Insert separator below",
        onClick: () => {
          const id = newSepId();
          const sep = createSeparator(id);
          rootContainer = rootContainer || getRootContainer();
          if (rootContainer) rootContainer.insertBefore(sep, node.nextSibling);
          saveRootOrder(store);
        },
      },
    ]);
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
