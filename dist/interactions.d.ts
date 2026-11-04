import { type ClientEvent, type PointerCaptureConfig, type RandomBytes } from "./client-sdk-core/index.js";
export interface InteractionCaptureOptions {
    emit(event: ClientEvent): void;
    randomBytes: RandomBytes;
    pointer: PointerCaptureConfig;
}
export interface InteractionCaptureHandle {
    /** Navigation counts as a click response for dead-click detection. */
    notifyNavigation(): void;
    teardown(): void;
}
/** Short, stable-ish selector for an element; never includes text content. */
export declare const computeSelector: (element: Element) => string;
/**
 * Pointer episodes (the core tracker over DOM pointer events) plus the two
 * signals only the browser can derive: dead clicks, which need a DOM-mutation
 * signal, and keyboard-activated clicks, which produce no pointer contact.
 */
export declare const installInteractionCapture: (options: InteractionCaptureOptions) => InteractionCaptureHandle;
