import { COUNTRIES } from "./countries";

function escapeText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function initCountryCombo(): void {
  const input = document.querySelector<HTMLInputElement>("#m-country-input");
  const list = document.querySelector<HTMLUListElement>("#m-country-list");
  const toggle = document.querySelector<HTMLButtonElement>("#m-country-toggle");
  const hidden = document.querySelector<HTMLInputElement>("#m-country-value");

  if (!input || !list || !toggle || !hidden || input.dataset.comboReady === "1") {
    return;
  }

  input.dataset.comboReady = "1";
  let activeIndex = -1;

  const updateActive = (): void => {
    list.querySelectorAll("li").forEach((item, index) => {
      item.classList.toggle("is-active", index === activeIndex);
    });
    list.querySelector("li.is-active")?.scrollIntoView({ block: "nearest" });
  };

  const render = (filter: string): void => {
    const query = filter.trim().toLowerCase();
    const items = query
      ? COUNTRIES.filter((country) => country.toLowerCase().includes(query))
      : [...COUNTRIES];

    list.innerHTML = items
      .map((country) => {
        const selected = country === hidden.value ? ' aria-selected="true"' : "";
        return `<li role="option" data-value="${escapeText(country)}"${selected}>${escapeText(country)}</li>`;
      })
      .join("");

    activeIndex = items.length ? 0 : -1;
    updateActive();
  };

  const open = (): void => {
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    render(input.value === hidden.value ? "" : input.value);
  };

  const close = (): void => {
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
    if (input.value !== hidden.value) {
      input.value = hidden.value || "";
    }
  };

  const commit = (value: string): void => {
    hidden.value = value;
    input.value = value;
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
  };

  input.addEventListener("focus", open);
  input.addEventListener("input", () => {
    open();
    render(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (list.hidden) {
        open();
      } else {
        activeIndex = Math.min(activeIndex + 1, list.children.length - 1);
        updateActive();
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActive();
    } else if (event.key === "Enter") {
      const active = list.querySelector<HTMLLIElement>("li.is-active");
      if (active?.dataset.value) {
        event.preventDefault();
        commit(active.dataset.value);
      }
    } else if (event.key === "Escape") {
      close();
      input.blur();
    }
  });

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    if (list.hidden) {
      input.focus();
      open();
    } else {
      close();
    }
  });

  list.addEventListener("mousedown", (event) => {
    const item = (event.target as HTMLElement).closest<HTMLLIElement>("li[data-value]");
    if (!item?.dataset.value) {
      return;
    }
    event.preventDefault();
    commit(item.dataset.value);
  });

  document.addEventListener("click", (event) => {
    if (list.hidden) {
      return;
    }
    const combo = document.querySelector("#m-country-combo");
    if (combo && !combo.contains(event.target as Node)) {
      close();
    }
  });
}
