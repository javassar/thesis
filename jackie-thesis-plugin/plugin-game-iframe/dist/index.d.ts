import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "plugin-game-iframe";
    readonly version: string;
    readonly parameters: {
        /** Path to the game HTML file (used as iframe src). Must be same-origin for input logging. */
        readonly game_url: {
            readonly type: ParameterType.STRING;
            readonly default: any;
        };
        /** The `type` field value in postMessage that signals the game is done. */
        readonly post_message_type: {
            readonly type: ParameterType.STRING;
            readonly default: "game-complete";
        };
        /** Whether to show a manual "End Game" button after a delay. */
        readonly allow_manual_end: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** Milliseconds before the manual end button appears (if allow_manual_end is true). */
        readonly manual_end_delay: {
            readonly type: ParameterType.INT;
            readonly default: 60000;
        };
        /** Label for the drawer toggle tab on the right edge. */
        readonly drawer_button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Menu";
        };
        /** Label for the emergency exit button inside the drawer. */
        readonly emergency_button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Report a Technical Issue";
        };
        /** Label for the manual end button inside the drawer. */
        readonly manual_end_button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "End Game";
        };
        /** Prompt text displayed above the emergency text area. */
        readonly emergency_text_prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "Please describe the technical issue you experienced:";
        };
        /** Whether to record mouse events (mousemove, mousedown, mouseup, click). */
        readonly record_mouse_events: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** Minimum milliseconds between mousemove samples. 0 means capture all events. Only used when record_mouse_events is true. */
        readonly mouse_sample_interval: {
            readonly type: ParameterType.INT;
            readonly default: 0;
        };
    };
    readonly data: {
        /** The reason the trial ended: "game-complete", "emergency-exit", or "manual-end". */
        readonly exit_reason: {
            readonly type: ParameterType.STRING;
        };
        /** Reaction time in milliseconds from trial start to trial end. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** Data payload from the game's postMessage, or null. */
        readonly game_data: {
            readonly type: ParameterType.COMPLEX;
        };
        /** Text entered in the emergency exit form, or null. */
        readonly emergency_text: {
            readonly type: ParameterType.STRING;
        };
        /** Array of keystroke events: { key, event, t }. */
        readonly keystrokes: {
            readonly type: ParameterType.COMPLEX;
        };
        /** Array of mouse events: { x, y, t, event }. */
        readonly mouse_events: {
            readonly type: ParameterType.COMPLEX;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * **plugin-game-iframe**
 *
 * Embed an HTML/JS game in a full-screen iframe with input logging and drawer UI.
 *
 * @author Jackie
 * @see {@link /plugin-game-iframe/README.md}
 */
declare class GameIframePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "plugin-game-iframe";
        readonly version: string;
        readonly parameters: {
            /** Path to the game HTML file (used as iframe src). Must be same-origin for input logging. */
            readonly game_url: {
                readonly type: ParameterType.STRING;
                readonly default: any;
            };
            /** The `type` field value in postMessage that signals the game is done. */
            readonly post_message_type: {
                readonly type: ParameterType.STRING;
                readonly default: "game-complete";
            };
            /** Whether to show a manual "End Game" button after a delay. */
            readonly allow_manual_end: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** Milliseconds before the manual end button appears (if allow_manual_end is true). */
            readonly manual_end_delay: {
                readonly type: ParameterType.INT;
                readonly default: 60000;
            };
            /** Label for the drawer toggle tab on the right edge. */
            readonly drawer_button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Menu";
            };
            /** Label for the emergency exit button inside the drawer. */
            readonly emergency_button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Report a Technical Issue";
            };
            /** Label for the manual end button inside the drawer. */
            readonly manual_end_button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "End Game";
            };
            /** Prompt text displayed above the emergency text area. */
            readonly emergency_text_prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "Please describe the technical issue you experienced:";
            };
            /** Whether to record mouse events (mousemove, mousedown, mouseup, click). */
            readonly record_mouse_events: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** Minimum milliseconds between mousemove samples. 0 means capture all events. Only used when record_mouse_events is true. */
            readonly mouse_sample_interval: {
                readonly type: ParameterType.INT;
                readonly default: 0;
            };
        };
        readonly data: {
            /** The reason the trial ended: "game-complete", "emergency-exit", or "manual-end". */
            readonly exit_reason: {
                readonly type: ParameterType.STRING;
            };
            /** Reaction time in milliseconds from trial start to trial end. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** Data payload from the game's postMessage, or null. */
            readonly game_data: {
                readonly type: ParameterType.COMPLEX;
            };
            /** Text entered in the emergency exit form, or null. */
            readonly emergency_text: {
                readonly type: ParameterType.STRING;
            };
            /** Array of keystroke events: { key, event, t }. */
            readonly keystrokes: {
                readonly type: ParameterType.COMPLEX;
            };
            /** Array of mouse events: { x, y, t, event }. */
            readonly mouse_events: {
                readonly type: ParameterType.COMPLEX;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
}

export { GameIframePlugin as default };
