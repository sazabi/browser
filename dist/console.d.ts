import type { ConsoleCaptureLevel, WebEvent } from "./types";
export interface ConsoleCaptureOptions {
    emit(event: WebEvent): void;
    levels: ConsoleCaptureLevel[];
}
export interface ConsoleCaptureHandle {
    teardown(): void;
}
/** SDK-emitted console lines carry this prefix and are never re-captured. */
export declare const SDK_CONSOLE_PREFIX = "[@sazabi/browser]";
/**
 * Mirror selected console levels into the event stream as `log` events.
 * The original console method always runs first — devtools behavior is never
 * altered — and capture failures are swallowed. Lines the SDK itself prints
 * (prefixed with SDK_CONSOLE_PREFIX) are skipped to avoid self-capture.
 */
export declare const installConsoleCapture: (options: ConsoleCaptureOptions) => ConsoleCaptureHandle;
