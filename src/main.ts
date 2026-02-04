import { invoke } from "@tauri-apps/api/core";

type EqState = {
  enabled: boolean;
  bands: Map<number, number>;
};

type EqPayload = {
  enabled: boolean;
  bands: Record<number, number>;
}

function sendEqState() {
  const payload: EqPayload = {
    enabled: eqState.enabled,
    bands: Object.fromEntries(eqState.bands),
  };

  invoke("update_eq", {
    payload
  }).catch(console.error);    
}

let eqState: EqState = {
  enabled: true,
  bands: new Map(),
};

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
  eqState.bands.clear();
  eqSliders.innerHTML = "";

  freqs.forEach(freq => {
    eqState.bands.set(freq, 0);
    const band = document.createElement("div");
    band.className = "eq-band";

    const valueLabel = document.createElement("div");
    valueLabel.className = "eq-value";
    valueLabel.textContent = "0.0"

    const sliderContainer = document.createElement("div");
    sliderContainer.className = "eq-slider-container";

    const track = document.createElement("div");
    track.className = "eq-track";

    const fill = document.createElement("div");
    fill.className = "eq-fill";

    const thumb = document.createElement("div");
    thumb.className = "eq-thumb";

    const centerLine = document.createElement("div");
    centerLine.className = "eq-center-line";

    let isDragging = false;
    const min = -12;
    const max = 12;

    function updateFill(value: number) {
      valueLabel.textContent =`${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
      const centerPos = 50; 
      const valuePos = ((value - min) / (max - min)) * 100;

      if (value === 0) {
        fill.style.height = "0%";
        fill.style.top = "50%";
        fill.style.bottom = "auto";
      } else if (value > 0) {
        fill.style.height = `${valuePos - centerPos}%`;
        fill.style.bottom = `${100 - centerPos}%`; 
        fill.style.top = "auto";
      } else {
        fill.style.height = `${centerPos - valuePos}%`;
        fill.style.top = `${centerPos}%`;
        fill.style.bottom = "auto";
      }

      thumb.style.top = `${100 - valuePos}%`;
      thumb.style.transform = "translateY(-50%)";
    }

    function handleMouseDown(e: MouseEvent) {
      isDragging = true;
      handleMove(e);
    }

    function handleMove(e: MouseEvent) {
      if (!isDragging) return;

      const rect = track.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const percent = Math.max(0, Math.min(100, (rect.height - y) / rect.height * 100));
      const value = min + (percent / 100) * (max - min);
      const roundedValue = Math.round(value * 10) / 10;

      updateFill(roundedValue);
      eqState.bands.set(freq, roundedValue);

      console.log(Object.fromEntries(eqState.bands));
    }

    function handleMouseUp() {
      if (isDragging) {
        sendEqState();
      }
      isDragging = false;
    }

    thumb.addEventListener("mousedown", handleMouseDown);
    track.addEventListener("mousedown", (e) => {
      handleMouseDown(e);
      handleMove(e);
    });
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleMouseUp);

    sliderContainer.appendChild(track);
    sliderContainer.appendChild(centerLine);
    sliderContainer.appendChild(fill);
    sliderContainer.appendChild(thumb);

    updateFill(0);
    band.appendChild(valueLabel);
    band.appendChild(sliderContainer);

    const label = document.createElement("span");
    label.textContent = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;

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
  eqState.enabled = eqEnabled.checked;
  sendEqState();
  eqSliders.style.opacity = eqEnabled.checked ? "1" : "0.4";
  eqSliders.style.pointerEvents = eqEnabled.checked ? "auto" : "none";
});

