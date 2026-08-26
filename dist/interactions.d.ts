import type { WebEvent } from "./types";
export interface InteractionCaptureOptions {
    emit(event: WebEvent): void;
}
export interface InteractionCaptureHandle {
    /** Navigation counts as a click response for dead-click detection. */
    notifyNavigation(): void;
    teardown(): void;
}
/** Short, stable-ish selector for an element; never includes text content. */
export declare const computeSelector: (element: Element) => string;
export declare const installInteractionCapture: (options: InteractionCaptureOptions) => InteractionCaptureHandle;
