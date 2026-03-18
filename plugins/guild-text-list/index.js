import { GUILD_SELECTOR, FOLDER_SELECTOR, ROOT_GROUP } from "./selectors.js";
import { textifyGuild, textifyFolder, cleanupGuilds, cleanupFolders, syncFolderSelection } from "./textify.js";
import { applyStoredRootOrder, setupDragAndContextMenu } from "./reorder.js";
import { setupResize } from "./resize.js";

const { plugin, flux } = shelter;
const { observeDom } = plugin.scoped;
const { GuildStore } = flux.storesFlat;
const { store } = plugin;

store.rootOrderV1 ??= [];

const folderCtx = { observeDom, GuildStore };

const scanAll = () => {
  for (const elem of document.querySelectorAll(GUILD_SELECTOR)) {
    textifyGuild(elem);
  }
  for (const elem of document.querySelectorAll(FOLDER_SELECTOR)) {
    textifyFolder(elem, folderCtx);
  }
  applyStoredRootOrder(store);
};

const observeOnce = () => {
  let scheduled = false;
  const unobserve = observeDom(
    `${GUILD_SELECTOR}, ${FOLDER_SELECTOR}`,
    (elem) => {
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
    },
  );
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

export function onLoad() {
  scanAll();
  observeOnce();
  applyRootOrderWhenReady();

  teardownDrag = setupDragAndContextMenu(store);
  teardownResize = setupResize(store);

  const triggers = ["GUILD_CREATE", "GUILD_DELETE", "GUILD_UPDATE"];
  for (const t of triggers) {
    plugin.scoped.flux.subscribe(t, observeOnce);
  }

  plugin.scoped.flux.subscribe("CHANNEL_SELECT", () => {
    observeOnce();
    queueMicrotask(syncFolderSelection);
  });
}

export function onUnload() {
  teardownDrag?.();
  teardownDrag = null;
  teardownResize?.();
  teardownResize = null;
  cleanupGuilds();
  cleanupFolders();
}
