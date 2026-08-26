import type { WebEvent } from "./types";
export interface NavigationCaptureOptions {
    emit(event: WebEvent): void;
    /** Fired on every captured navigation (dead-click signal). */
    onNavigate(): void;
}
export interface NavigationCaptureHandle {
    teardown(): void;
}
/**
 * Install dormant history patches around whatever implementations are
 * currently live. Idempotent; re-wraps if a later actor replaced the methods
 * after an earlier install (the displaced wrappers are inert passthroughs).
 */
export declare const ensureNavigationPatches: () => void;
/** Restore the natives if the current implementations are still ours. */
export declare const uninstallNavigationPatches: () => void;
/**
 * SPA navigation capture. Listeners alone miss programmatic navigation —
 * which is most navigation in React apps — so `history.pushState` /
 * `replaceState` are wrapped under the same isolation rules as the network
 * patch.
 */
export declare const installNavigationCapture: (options: NavigationCaptureOptions) => NavigationCaptureHandle;
