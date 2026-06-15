# plugin-game-iframe

Embed an HTML/JS game in a full-screen iframe with input logging and a slide-out drawer UI. The game signals completion via `postMessage`. The plugin records keystrokes and (optionally) mouse events throughout the trial. A drawer panel provides an emergency exit with a text report form and an optional manual end button that appears after a configurable delay.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter | Type | Default Value | Description |
| ---- | ---- | ---- | ---- |
| game_url | STRING | *undefined* | Path to the game HTML file (used as the iframe `src`). Must be same-origin for input logging to work inside the iframe. |
| post_message_type | STRING | `"game-complete"` | The `type` field value in the `postMessage` the game sends to signal it is done. |
| allow_manual_end | BOOL | `false` | Whether to show a manual "End Game" button in the drawer after a delay. |
| manual_end_delay | INT | `60000` | Milliseconds before the manual end button appears. Only used when `allow_manual_end` is `true`. |
| drawer_button_label | STRING | `"Menu"` | Label for the drawer toggle tab on the right edge of the screen. |
| emergency_button_label | STRING | `"Report a Technical Issue"` | Label for the emergency exit button inside the drawer. |
| manual_end_button_label | STRING | `"End Game"` | Label for the manual end button inside the drawer. |
| emergency_text_prompt | HTML_STRING | `"Please describe the technical issue you experienced:"` | Prompt text displayed above the emergency text area. |
| record_mouse_events | BOOL | `false` | Whether to record mouse events (mousemove, mousedown, mouseup, click). |
| mouse_sample_interval | INT | `0` | Minimum milliseconds between mousemove samples. `0` captures every event. Only used when `record_mouse_events` is `true`. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name | Type | Value |
| ---- | ---- | ---- |
| exit_reason | string | The reason the trial ended. One of `"game-complete"`, `"emergency-exit"`, or `"manual-end"`. |
| rt | numeric | Time in milliseconds from trial start to trial end. |
| game_data | object | The `data` property from the game's `postMessage` payload, or `null` if the trial ended via emergency exit or manual end. |
| emergency_text | string | Text the participant entered in the emergency exit form, or `null` if the trial did not end via emergency exit. |
| keystrokes | array | Array of keystroke objects. Each entry has `{ key: string, event: "keydown" \| "keyup", t: number }` where `t` is milliseconds from trial start. |
| mouse_events | array | Array of mouse event objects. Each entry has `{ x: number, y: number, t: number, event: string }` where `event` is `"mousemove"`, `"mousedown"`, `"mouseup"`, or `"click"` and `t` is milliseconds from trial start. Empty array if `record_mouse_events` is `false`. |

## Install

Using NPM:

```
npm install plugin-game-iframe
```

```javascript
import GameIframePlugin from "plugin-game-iframe";
```

Using a script tag:

```html
<script src="https://unpkg.com/plugin-game-iframe"></script>
```

When loaded via a script tag, the plugin is available as `jsPsychGameIframe`.

## Examples

### Basic usage with game completion via postMessage

```javascript
var trial = {
  type: jsPsychGameIframe,
  game_url: "game/index.html",
};
```

The game HTML should send a `postMessage` when it finishes:

```javascript
// Inside the game
window.parent.postMessage({ type: "game-complete", data: { score: 42 } }, "*");
```

### Enable mouse recording and manual end button

```javascript
var trial = {
  type: jsPsychGameIframe,
  game_url: "game/index.html",
  record_mouse_events: true,
  mouse_sample_interval: 50,
  allow_manual_end: true,
  manual_end_delay: 30000,
};
```

### Custom labels and emergency prompt

```javascript
var trial = {
  type: jsPsychGameIframe,
  game_url: "game/index.html",
  drawer_button_label: "Help",
  emergency_button_label: "Something went wrong",
  emergency_text_prompt: "<strong>What happened?</strong> Please describe the issue below.",
};
```
