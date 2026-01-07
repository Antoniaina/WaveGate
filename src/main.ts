const tabs = document.querySelectorAll<HTMLButtonElement>(".tab");
const panels = document.querySelectorAll<HTMLElement>(".tab-panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.classList.contains("add")) {
      console.log("Add new module (later)");
      return;
    }

    const target = tab.dataset.tab;
    if (!target) return;

    tabs.forEach((t) => t.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(`tab-${target}`)?.classList.add("active");
  });
});
