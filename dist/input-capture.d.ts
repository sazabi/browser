import type { WebEvent } from "./types";
export interface InputCaptureOptions {
    emit(event: WebEvent): void;
}
export interface InputCaptureHandle {
    /** SPA navigation ends any open episodes. */
    notifyNavigation(): void;
    teardown(): void;
}
/**
 * Field-interaction episodes: one `input` event per engagement with an
 * editable element, not per keystroke. The event is timestamped at episode
 * START (so the timeline reads causally: typed → the request that followed)
 * and emitted when the episode ends — blur, Enter, ~10s idle, SPA
 * navigation, tab hidden, or teardown.
 *
 * Privacy invariants: `event.data`, field values, selected option text, and
 * key identities are never read (Enter is inspected solely as a boundary and
 * never recorded); no value derivatives, including length. Names come from
 * developer-authored sources only (see element-name.ts).
 */
export declare const installInputCapture: (options: InputCaptureOptions) => InputCaptureHandle;
