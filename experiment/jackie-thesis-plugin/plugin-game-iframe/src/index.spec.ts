import { startTimeline, clickTarget, pressKey } from "@jspsych/test-utils";

import GameIframePlugin from ".";

jest.useFakeTimers();

// Helper: dispatch a postMessage event synchronously on window
function sendGameComplete(data: any = null, type = "game-complete") {
  window.dispatchEvent(
    new MessageEvent("message", {
      data: { type, data },
    })
  );
}

// Helper: get a DOM element inside the display, throwing if missing
function q(displayElement: HTMLElement, selector: string): HTMLElement {
  const el = displayElement.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

describe("game-iframe plugin", () => {
  // ── game_url ────────────────────────────────────────────────────────

  describe("game_url", () => {
    it("sets the iframe src to the provided URL", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "mygame/index.html",
        },
      ]);

      const iframe = q(displayElement, "iframe.gi-iframe") as HTMLIFrameElement;
      expect(iframe.src).toContain("mygame/index.html");

      sendGameComplete();
    });
  });

  // ── post_message_type ───────────────────────────────────────────────

  describe("post_message_type", () => {
    it("ends the trial on the default 'game-complete' message type", async () => {
      const { expectFinished, getData } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
        },
      ]);

      sendGameComplete({ score: 10 });
      await expectFinished();

      const data = getData().values()[0];
      expect(data.exit_reason).toBe("game-complete");
      expect(data.game_data).toEqual({ score: 10 });
    });

    it("uses a custom post_message_type", async () => {
      const { expectFinished, expectRunning, getData } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
          post_message_type: "done",
        },
      ]);

      // Default type should NOT end the trial
      sendGameComplete(null, "game-complete");
      await expectRunning();

      // Custom type should end it
      sendGameComplete({ result: "win" }, "done");
      await expectFinished();

      expect(getData().values()[0].exit_reason).toBe("game-complete");
      expect(getData().values()[0].game_data).toEqual({ result: "win" });
    });
  });

  // ── allow_manual_end ────────────────────────────────────────────────

  describe("allow_manual_end", () => {
    it("does not show the manual end button when false (default)", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
        },
      ]);

      const btn = q(displayElement, ".gi-manual-end-btn");
      expect(btn.classList.contains("visible")).toBe(false);

      // Even after a long time it should stay hidden
      jest.advanceTimersByTime(120000);
      expect(btn.classList.contains("visible")).toBe(false);

      sendGameComplete();
    });

    it("shows the manual end button after delay when true", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
          allow_manual_end: true,
          manual_end_delay: 5000,
        },
      ]);

      const btn = q(displayElement, ".gi-manual-end-btn");
      expect(btn.classList.contains("visible")).toBe(false);

      jest.advanceTimersByTime(5000);
      expect(btn.classList.contains("visible")).toBe(true);

      sendGameComplete();
    });

    it("ends the trial with 'manual-end' when the button is clicked", async () => {
      const { displayElement, expectFinished, getData } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
          allow_manual_end: true,
          manual_end_delay: 0,
        },
      ]);

      jest.advanceTimersByTime(0);

      const btn = q(displayElement, ".gi-manual-end-btn");
      await clickTarget(btn);
      await expectFinished();

      const data = getData().values()[0];
      expect(data.exit_reason).toBe("manual-end");
      expect(data.game_data).toBeNull();
    });
  });

  // ── manual_end_delay ────────────────────────────────────────────────

  describe("manual_end_delay", () => {
    it("respects a custom delay before showing the button", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
          allow_manual_end: true,
          manual_end_delay: 30000,
        },
      ]);

      const btn = q(displayElement, ".gi-manual-end-btn");

      jest.advanceTimersByTime(29999);
      expect(btn.classList.contains("visible")).toBe(false);

      jest.advanceTimersByTime(1);
      expect(btn.classList.contains("visible")).toBe(true);

      sendGameComplete();
    });
  });

  // ── drawer_button_label ─────────────────────────────────────────────

  describe("drawer_button_label", () => {
    it("uses the default label 'Menu'", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
        },
      ]);

      const tab = q(displayElement, ".gi-drawer-tab");
      expect(tab.textContent).toBe("Menu");

      sendGameComplete();
    });

    it("uses a custom label", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
          drawer_button_label: "Help",
        },
      ]);

      const tab = q(displayElement, ".gi-drawer-tab");
      expect(tab.textContent).toBe("Help");

      sendGameComplete();
    });
  });

  // ── emergency_button_label ──────────────────────────────────────────

  describe("emergency_button_label", () => {
    it("uses the default label", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
        },
      ]);

      const btn = q(displayElement, ".gi-emergency-btn");
      expect(btn.textContent).toBe("Report a Technical Issue");

      sendGameComplete();
    });

    it("uses a custom label", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
          emergency_button_label: "Something broke",
        },
      ]);

      const btn = q(displayElement, ".gi-emergency-btn");
      expect(btn.textContent).toBe("Something broke");

      sendGameComplete();
    });
  });

  // ── manual_end_button_label ─────────────────────────────────────────

  describe("manual_end_button_label", () => {
    it("uses the default label 'End Game'", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
          allow_manual_end: true,
        },
      ]);

      const btn = q(displayElement, ".gi-manual-end-btn");
      expect(btn.textContent).toBe("End Game");

      sendGameComplete();
    });

    it("uses a custom label", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
          allow_manual_end: true,
          manual_end_button_label: "I'm Done",
        },
      ]);

      const btn = q(displayElement, ".gi-manual-end-btn");
      expect(btn.textContent).toBe("I'm Done");

      sendGameComplete();
    });
  });

  // ── emergency_text_prompt ───────────────────────────────────────────

  describe("emergency_text_prompt", () => {
    it("uses the default prompt text", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
        },
      ]);

      const label = q(displayElement, ".gi-emergency-form label");
      expect(label.textContent).toBe(
        "Please describe the technical issue you experienced:"
      );

      sendGameComplete();
    });

    it("renders custom HTML in the prompt", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
          emergency_text_prompt: "<strong>What happened?</strong>",
        },
      ]);

      const label = q(displayElement, ".gi-emergency-form label");
      expect(label.innerHTML).toBe("<strong>What happened?</strong>");

      sendGameComplete();
    });

    it("submits emergency text and ends the trial", async () => {
      const { displayElement, expectFinished, getData } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
        },
      ]);

      // Open drawer
      await clickTarget(q(displayElement, ".gi-drawer-tab"));

      // Click emergency button to reveal form
      await clickTarget(q(displayElement, ".gi-emergency-btn"));

      // Type into textarea
      const textarea = q(displayElement, ".gi-emergency-form textarea") as HTMLTextAreaElement;
      textarea.value = "The screen froze";

      // Submit
      await clickTarget(q(displayElement, ".gi-emergency-submit"));
      await expectFinished();

      const data = getData().values()[0];
      expect(data.exit_reason).toBe("emergency-exit");
      expect(data.emergency_text).toBe("The screen froze");
      expect(data.game_data).toBeNull();
    });
  });

  // ── record_mouse_events ─────────────────────────────────────────────

  describe("record_mouse_events", () => {
    it("does not record mouse events when false (default)", async () => {
      const { expectFinished, getData } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
        },
      ]);

      // Dispatch some mouse events
      document.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 100, clientY: 200, bubbles: true })
      );
      document.dispatchEvent(
        new MouseEvent("click", { clientX: 50, clientY: 50, bubbles: true })
      );

      sendGameComplete();
      await expectFinished();

      const data = getData().values()[0];
      expect(data.mouse_events).toEqual([]);
    });

    it("records mouse events when true", async () => {
      const { expectFinished, getData } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
          record_mouse_events: true,
        },
      ]);

      document.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 100, clientY: 200, bubbles: true })
      );
      document.dispatchEvent(
        new MouseEvent("click", { clientX: 50, clientY: 75, bubbles: true })
      );
      document.dispatchEvent(
        new MouseEvent("mousedown", { clientX: 10, clientY: 20, bubbles: true })
      );
      document.dispatchEvent(
        new MouseEvent("mouseup", { clientX: 10, clientY: 20, bubbles: true })
      );

      sendGameComplete();
      await expectFinished();

      const data = getData().values()[0];
      expect(data.mouse_events.length).toBe(4);
      expect(data.mouse_events[0]).toMatchObject({
        x: 100,
        y: 200,
        event: "mousemove",
      });
      expect(data.mouse_events[1]).toMatchObject({
        x: 50,
        y: 75,
        event: "click",
      });
      expect(data.mouse_events[2]).toMatchObject({ event: "mousedown" });
      expect(data.mouse_events[3]).toMatchObject({ event: "mouseup" });
      // All entries should have a timestamp
      for (const evt of data.mouse_events) {
        expect(typeof evt.t).toBe("number");
      }
    });
  });

  // ── mouse_sample_interval ───────────────────────────────────────────

  describe("mouse_sample_interval", () => {
    it("captures every mousemove when set to 0 (default)", async () => {
      const { expectFinished, getData } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
          record_mouse_events: true,
          mouse_sample_interval: 0,
        },
      ]);

      for (let i = 0; i < 5; i++) {
        document.dispatchEvent(
          new MouseEvent("mousemove", { clientX: i, clientY: i, bubbles: true })
        );
      }

      sendGameComplete();
      await expectFinished();

      const moves = getData()
        .values()[0]
        .mouse_events.filter((e: any) => e.event === "mousemove");
      expect(moves.length).toBe(5);
    });

    it("throttles mousemove events based on interval", async () => {
      // Use real performance.now for this test by mocking it to increment
      let mockNow = 1000;
      const originalNow = performance.now;
      performance.now = () => mockNow;

      const { expectFinished, getData } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
          record_mouse_events: true,
          mouse_sample_interval: 100,
        },
      ]);

      // First event at t=1000 — should be recorded
      document.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 0, clientY: 0, bubbles: true })
      );

      // Second event at t=1050 — should be throttled (< 100ms)
      mockNow = 1050;
      document.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 1, clientY: 1, bubbles: true })
      );

      // Third event at t=1100 — should be recorded (>= 100ms from first)
      mockNow = 1100;
      document.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 2, clientY: 2, bubbles: true })
      );

      sendGameComplete();
      await expectFinished();

      const moves = getData()
        .values()[0]
        .mouse_events.filter((e: any) => e.event === "mousemove");
      expect(moves.length).toBe(2);
      expect(moves[0].x).toBe(0);
      expect(moves[1].x).toBe(2);

      performance.now = originalNow;
    });

    it("does not throttle click/mousedown/mouseup even with an interval", async () => {
      let mockNow = 1000;
      const originalNow = performance.now;
      performance.now = () => mockNow;

      const { expectFinished, getData } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
          record_mouse_events: true,
          mouse_sample_interval: 10000,
        },
      ]);

      // Rapid-fire non-mousemove events — all should be recorded
      document.dispatchEvent(
        new MouseEvent("click", { clientX: 1, clientY: 1, bubbles: true })
      );
      mockNow = 1001;
      document.dispatchEvent(
        new MouseEvent("mousedown", { clientX: 2, clientY: 2, bubbles: true })
      );
      mockNow = 1002;
      document.dispatchEvent(
        new MouseEvent("mouseup", { clientX: 3, clientY: 3, bubbles: true })
      );

      sendGameComplete();
      await expectFinished();

      const events = getData().values()[0].mouse_events;
      expect(events.length).toBe(3);

      performance.now = originalNow;
    });
  });

  // ── keystroke recording (always on) ─────────────────────────────────

  describe("keystroke recording", () => {
    it("records keydown and keyup events", async () => {
      const { expectFinished, getData } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
        },
      ]);

      await pressKey("a");
      await pressKey("ArrowUp");

      sendGameComplete();
      await expectFinished();

      const ks = getData().values()[0].keystrokes;
      expect(ks.length).toBe(4); // 2 keydown + 2 keyup
      expect(ks[0]).toMatchObject({ key: "a", event: "keydown" });
      expect(ks[1]).toMatchObject({ key: "a", event: "keyup" });
      expect(ks[2]).toMatchObject({ key: "ArrowUp", event: "keydown" });
      expect(ks[3]).toMatchObject({ key: "ArrowUp", event: "keyup" });
      for (const k of ks) {
        expect(typeof k.t).toBe("number");
      }
    });
  });

  // ── drawer open / close ─────────────────────────────────────────────

  describe("drawer interaction", () => {
    it("opens the drawer when the tab is clicked", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
        },
      ]);

      const panel = q(displayElement, ".gi-drawer-panel");
      expect(panel.classList.contains("open")).toBe(false);

      await clickTarget(q(displayElement, ".gi-drawer-tab"));
      expect(panel.classList.contains("open")).toBe(true);

      sendGameComplete();
    });

    it("closes the drawer when the close button is clicked", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
        },
      ]);

      // Open then close
      await clickTarget(q(displayElement, ".gi-drawer-tab"));
      const panel = q(displayElement, ".gi-drawer-panel");
      expect(panel.classList.contains("open")).toBe(true);

      await clickTarget(q(displayElement, ".gi-drawer-close"));
      expect(panel.classList.contains("open")).toBe(false);

      sendGameComplete();
    });

    it("closes the drawer when the overlay is clicked", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
        },
      ]);

      await clickTarget(q(displayElement, ".gi-drawer-tab"));
      const panel = q(displayElement, ".gi-drawer-panel");
      expect(panel.classList.contains("open")).toBe(true);

      await clickTarget(q(displayElement, ".gi-overlay"));
      expect(panel.classList.contains("open")).toBe(false);

      sendGameComplete();
    });
  });

  // ── data output structure ───────────────────────────────────────────

  describe("data output", () => {
    it("includes rt as a positive number", async () => {
      const { expectFinished, getData } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
        },
      ]);

      sendGameComplete();
      await expectFinished();

      const data = getData().values()[0];
      expect(typeof data.rt).toBe("number");
      expect(data.rt).toBeGreaterThanOrEqual(0);
    });

    it("sets emergency_text to null on game-complete", async () => {
      const { expectFinished, getData } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
        },
      ]);

      sendGameComplete();
      await expectFinished();

      expect(getData().values()[0].emergency_text).toBeNull();
    });

    it("cleans up DOM after trial ends", async () => {
      const { displayElement } = await startTimeline([
        {
          type: GameIframePlugin,
          game_url: "game.html",
        },
      ]);

      expect(displayElement.querySelector(".gi-container")).not.toBeNull();
      sendGameComplete();
      expect(displayElement.querySelector(".gi-container")).toBeNull();
    });
  });
});
