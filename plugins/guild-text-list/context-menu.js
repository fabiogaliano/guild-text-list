import styles from "./styles.module.css";

let rootMenu = null;
let rootMenuCleanup = null;

export const closeRootMenu = () => {
  rootMenuCleanup?.();
  rootMenuCleanup = null;
  rootMenu?.remove();
  rootMenu = null;
};

export const openRootMenu = (x, y, items) => {
  closeRootMenu();

  const menu = document.createElement("div");
  menu.className = styles.rootMenu;

  for (const item of items) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = styles.rootMenuButton;
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
