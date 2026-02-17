'use strict';

var jspsych = require('jspsych');

var version = "0.0.1";

const info = {
  name: "plugin-game-iframe",
  version,
  parameters: {
    /** Path to the game HTML file (used as iframe src). Must be same-origin for input logging. */
    game_url: {
      type: jspsych.ParameterType.STRING,
      default: void 0
    },
    /** The `type` field value in postMessage that signals the game is done. */
    post_message_type: {
      type: jspsych.ParameterType.STRING,
      default: "game-complete"
    },
    /** Whether to show a manual "End Game" button after a delay. */
    allow_manual_end: {
      type: jspsych.ParameterType.BOOL,
      default: false
    },
    /** Milliseconds before the manual end button appears (if allow_manual_end is true). */
    manual_end_delay: {
      type: jspsych.ParameterType.INT,
      default: 6e4
    },
    /** Label for the drawer toggle tab on the right edge. */
    drawer_button_label: {
      type: jspsych.ParameterType.STRING,
      default: "Menu"
    },
    /** Label for the emergency exit button inside the drawer. */
    emergency_button_label: {
      type: jspsych.ParameterType.STRING,
      default: "Report a Technical Issue"
    },
    /** Label for the manual end button inside the drawer. */
    manual_end_button_label: {
      type: jspsych.ParameterType.STRING,
      default: "End Game"
    },
    /** Prompt text displayed above the emergency text area. */
    emergency_text_prompt: {
      type: jspsych.ParameterType.HTML_STRING,
      default: "Please describe the technical issue you experienced:"
    },
    /** Whether to record mouse events (mousemove, mousedown, mouseup, click). */
    record_mouse_events: {
      type: jspsych.ParameterType.BOOL,
      default: false
    },
    /** Minimum milliseconds between mousemove samples. 0 means capture all events. Only used when record_mouse_events is true. */
    mouse_sample_interval: {
      type: jspsych.ParameterType.INT,
      default: 0
    }
  },
  data: {
    /** The reason the trial ended: "game-complete", "emergency-exit", or "manual-end". */
    exit_reason: {
      type: jspsych.ParameterType.STRING
    },
    /** Reaction time in milliseconds from trial start to trial end. */
    rt: {
      type: jspsych.ParameterType.INT
    },
    /** Data payload from the game's postMessage, or null. */
    game_data: {
      type: jspsych.ParameterType.COMPLEX
    },
    /** Text entered in the emergency exit form, or null. */
    emergency_text: {
      type: jspsych.ParameterType.STRING
    },
    /** Array of keystroke events: { key, event, t }. */
    keystrokes: {
      type: jspsych.ParameterType.COMPLEX
    },
    /** Array of mouse events: { x, y, t, event }. */
    mouse_events: {
      type: jspsych.ParameterType.COMPLEX
    }
  },
  citations: "__CITATIONS__"
};
class GameIframePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    const startTime = performance.now();
    let trialEnded = false;
    const keystrokes = [];
    const mouse_events = [];
    let lastMouseSampleTime = 0;
    const cleanupFns = [];
    const style = document.createElement("style");
    style.textContent = `
      .gi-container {
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        z-index: 10000;
        background: #000;
      }
      .gi-iframe {
        width: 100%; height: 100%;
        border: none;
      }

      /* Drawer tab */
      .gi-drawer-tab {
        position: fixed;
        top: 50%; right: 0;
        transform: translateY(-50%);
        z-index: 10002;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        padding: 12px 6px;
        background: #444;
        color: #fff;
        border: none;
        border-radius: 6px 0 0 6px;
        cursor: pointer;
        font-size: 14px;
        font-family: sans-serif;
        letter-spacing: 1px;
      }
      .gi-drawer-tab:hover {
        background: #666;
      }

      /* Drawer panel */
      .gi-drawer-panel {
        position: fixed;
        top: 0; right: -320px;
        width: 320px; height: 100vh;
        background: #f5f5f5;
        z-index: 10003;
        transition: right 0.25s ease;
        display: flex;
        flex-direction: column;
        font-family: sans-serif;
        box-shadow: -2px 0 8px rgba(0,0,0,0.3);
      }
      .gi-drawer-panel.open {
        right: 0;
      }
      .gi-drawer-header {
        display: flex;
        justify-content: flex-end;
        padding: 8px 12px;
        border-bottom: 1px solid #ddd;
      }
      .gi-drawer-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #333;
        padding: 4px 8px;
      }
      .gi-drawer-body {
        padding: 20px;
        flex: 1;
        overflow-y: auto;
      }

      /* Emergency button */
      .gi-emergency-btn {
        width: 100%;
        padding: 12px;
        background: #d32f2f;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 15px;
        cursor: pointer;
        margin-bottom: 16px;
      }
      .gi-emergency-btn:hover {
        background: #b71c1c;
      }

      /* Emergency form */
      .gi-emergency-form {
        display: none;
        margin-bottom: 16px;
      }
      .gi-emergency-form.visible {
        display: block;
      }
      .gi-emergency-form label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: #333;
      }
      .gi-emergency-form textarea {
        width: 100%;
        height: 100px;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
        resize: vertical;
        box-sizing: border-box;
        margin-bottom: 8px;
      }
      .gi-emergency-submit {
        width: 100%;
        padding: 10px;
        background: #d32f2f;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
      }
      .gi-emergency-submit:hover {
        background: #b71c1c;
      }

      /* Manual end button */
      .gi-manual-end-btn {
        width: 100%;
        padding: 12px;
        background: #1565c0;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 15px;
        cursor: pointer;
        display: none;
      }
      .gi-manual-end-btn:hover {
        background: #0d47a1;
      }
      .gi-manual-end-btn.visible {
        display: block;
      }

      /* Overlay behind drawer */
      .gi-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.4);
        z-index: 10001;
        display: none;
      }
      .gi-overlay.visible {
        display: block;
      }
    `;
    document.head.appendChild(style);
    cleanupFns.push(() => style.remove());
    const container = document.createElement("div");
    container.className = "gi-container";
    const iframe = document.createElement("iframe");
    iframe.className = "gi-iframe";
    iframe.src = trial.game_url;
    container.appendChild(iframe);
    const overlay = document.createElement("div");
    overlay.className = "gi-overlay";
    container.appendChild(overlay);
    const drawerTab = document.createElement("button");
    drawerTab.className = "gi-drawer-tab";
    drawerTab.textContent = trial.drawer_button_label;
    container.appendChild(drawerTab);
    const drawerPanel = document.createElement("div");
    drawerPanel.className = "gi-drawer-panel";
    const drawerHeader = document.createElement("div");
    drawerHeader.className = "gi-drawer-header";
    const closeBtn = document.createElement("button");
    closeBtn.className = "gi-drawer-close";
    closeBtn.innerHTML = "&times;";
    drawerHeader.appendChild(closeBtn);
    drawerPanel.appendChild(drawerHeader);
    const drawerBody = document.createElement("div");
    drawerBody.className = "gi-drawer-body";
    const emergencyBtn = document.createElement("button");
    emergencyBtn.className = "gi-emergency-btn";
    emergencyBtn.textContent = trial.emergency_button_label;
    drawerBody.appendChild(emergencyBtn);
    const emergencyForm = document.createElement("div");
    emergencyForm.className = "gi-emergency-form";
    const emergencyLabel = document.createElement("label");
    emergencyLabel.innerHTML = trial.emergency_text_prompt;
    emergencyForm.appendChild(emergencyLabel);
    const emergencyTextarea = document.createElement("textarea");
    emergencyForm.appendChild(emergencyTextarea);
    const emergencySubmit = document.createElement("button");
    emergencySubmit.className = "gi-emergency-submit";
    emergencySubmit.textContent = "Submit & Exit";
    emergencyForm.appendChild(emergencySubmit);
    drawerBody.appendChild(emergencyForm);
    const manualEndBtn = document.createElement("button");
    manualEndBtn.className = "gi-manual-end-btn";
    manualEndBtn.textContent = trial.manual_end_button_label;
    drawerBody.appendChild(manualEndBtn);
    drawerPanel.appendChild(drawerBody);
    container.appendChild(drawerPanel);
    display_element.appendChild(container);
    const openDrawer = () => {
      drawerPanel.classList.add("open");
      overlay.classList.add("visible");
    };
    const closeDrawer = () => {
      drawerPanel.classList.remove("open");
      overlay.classList.remove("visible");
      iframe.focus();
    };
    drawerTab.addEventListener("click", openDrawer);
    closeBtn.addEventListener("click", closeDrawer);
    overlay.addEventListener("click", closeDrawer);
    emergencyBtn.addEventListener("click", () => {
      emergencyForm.classList.add("visible");
      emergencyBtn.style.display = "none";
    });
    emergencySubmit.addEventListener("click", () => {
      endTrial("emergency-exit", null, emergencyTextarea.value || null);
    });
    manualEndBtn.addEventListener("click", () => {
      endTrial("manual-end", null, null);
    });
    if (trial.allow_manual_end) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        manualEndBtn.classList.add("visible");
      }, trial.manual_end_delay);
    }
    const logKey = (e) => {
      keystrokes.push({
        key: e.key,
        event: e.type,
        t: Math.round(performance.now() - startTime)
      });
    };
    const logMouse = (e) => {
      const now = performance.now();
      if (trial.mouse_sample_interval > 0 && e.type === "mousemove" && now - lastMouseSampleTime < trial.mouse_sample_interval) {
        return;
      }
      if (e.type === "mousemove") {
        lastMouseSampleTime = now;
      }
      mouse_events.push({
        x: e.clientX,
        y: e.clientY,
        t: Math.round(now - startTime),
        event: e.type
      });
    };
    const keyEvents = ["keydown", "keyup"];
    const mouseEventTypes = [
      "mousemove",
      "mousedown",
      "mouseup",
      "click"
    ];
    for (const evt of keyEvents) {
      document.addEventListener(evt, logKey, true);
      cleanupFns.push(
        () => document.removeEventListener(evt, logKey, true)
      );
    }
    if (trial.record_mouse_events) {
      for (const evt of mouseEventTypes) {
        document.addEventListener(evt, logMouse, true);
        cleanupFns.push(
          () => document.removeEventListener(evt, logMouse, true)
        );
      }
    }
    const attachIframeListeners = () => {
      try {
        const iframeDoc = iframe.contentDocument;
        if (!iframeDoc) return;
        for (const evt of keyEvents) {
          iframeDoc.addEventListener(evt, logKey, true);
          cleanupFns.push(
            () => iframeDoc.removeEventListener(evt, logKey, true)
          );
        }
        if (trial.record_mouse_events) {
          for (const evt of mouseEventTypes) {
            iframeDoc.addEventListener(evt, logMouse, true);
            cleanupFns.push(
              () => iframeDoc.removeEventListener(evt, logMouse, true)
            );
          }
        }
      } catch (e) {
        console.warn(
          "plugin-game-iframe: Could not attach listeners to iframe (cross-origin?).",
          e
        );
      }
    };
    iframe.addEventListener("load", () => {
      attachIframeListeners();
      iframe.focus();
    });
    const messageHandler = (event) => {
      if (event.data && typeof event.data === "object" && event.data.type === trial.post_message_type) {
        endTrial("game-complete", event.data.data ?? null, null);
      }
    };
    window.addEventListener("message", messageHandler);
    cleanupFns.push(
      () => window.removeEventListener("message", messageHandler)
    );
    const endTrial = (exit_reason, game_data, emergency_text) => {
      if (trialEnded) return;
      trialEnded = true;
      const rt = Math.round(performance.now() - startTime);
      for (const fn of cleanupFns) {
        fn();
      }
      container.remove();
      this.jsPsych.finishTrial({
        exit_reason,
        rt,
        game_data,
        emergency_text,
        keystrokes,
        mouse_events
      });
    };
  }
}

module.exports = GameIframePlugin;
//# sourceMappingURL=index.cjs.map
