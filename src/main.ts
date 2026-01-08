const tabs = document.querySelectorAll<HTMLButtonElement>(".tab");
const panels = document.querySelectorAll<HTMLElement>(".tab-panel");
const eqSliders = document.getElementById("eq-sliders")!;
const bandsSelect = document.getElementById("eq-bands-select") as HTMLSelectElement;
const eqEnabled = document.getElementById("eq-enabled") as HTMLInputElement;

const FREQUENCIES_15 = [
  25, 40, 63, 100, 160,
  250, 400, 630, 1000,
  1600, 2500, 4000, 6300, 10000, 16000
];

const FREQUENCIES_31 = [
  20, 25, 31, 40, 50, 63, 80, 100,
  125, 160, 200, 250, 315, 400,
  500, 630, 800, 1000, 1250, 1600,
  2000, 2500, 3150, 4000, 5000,
  6300, 8000, 10000, 12500, 16000, 20000
];

function createSliders(freqs: number[]) {
  eqSliders.innerHTML = "";

  freqs.forEach(freq => {
    const band = document.createElement("div");
    band.className = "eq-band";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "-12";
    slider.max = "12";
    slider.step = "0.1";
    slider.value = "0";

    slider.addEventListener("input", () => {
      console.log(`Freq ${freq}Hz: ${slider.value} dB`);
    });

    const label = document.createElement("span");
    label.textContent = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;

    band.appendChild(slider);
    band.appendChild(label);
    eqSliders.appendChild(band);
  });
}

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

createSliders(FREQUENCIES_15);

bandsSelect.addEventListener("change", () => {
  if (bandsSelect.value === "15") {
    createSliders(FREQUENCIES_15);
  } else if (bandsSelect.value === "31") {
    createSliders(FREQUENCIES_31);
  }
});

eqEnabled.addEventListener("change", () => {
  eqSliders.style.opacity = eqEnabled.checked ? "1" : "0.4";
  eqSliders.style.pointerEvents = eqEnabled.checked ? "auto" : "none";

  console.log("EQ enabled:", eqEnabled.checked);
});

