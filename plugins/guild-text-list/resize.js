import styles from "./styles.module.css";
import { NAV } from "./selectors.js";

let handle = null;
let isDragging = false;

export const setupResize = (store) => {
  const nav = document.querySelector(NAV);
  if (!nav) return () => {};

  const saved = store.sidebarWidth;
  if (saved && typeof saved === "number") {
    nav.style.setProperty("--guild-text-w", `${saved}px`);
  }
  nav.classList.add(styles.sidebar);

  handle = document.createElement("div");
  handle.className = styles.resizeHandle;
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
    store.sidebarWidth = Math.round(finalW);
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
    nav.classList.remove(styles.sidebar);
    nav.style.removeProperty("--guild-text-w");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };
};
