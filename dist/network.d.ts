import { type NetworkCaptureOptions } from "./client-sdk-core/index.js";
export interface NetworkCaptureHandle {
    teardown(): void;
}
/**
 * Install dormant fetch/XHR patches around whatever implementations are
 * currently live. Idempotent, and re-wraps when a later actor (test stubs,
 * mocking layers) replaced the primitives after an earlier install; the
 * displaced wrapper is an inert passthrough, so single-processing holds.
 */
export declare const ensureNetworkPatches: () => void;
/**
 * Restore the natives if the current implementations are still ours; if
 * someone patched on top of us, restoring would clobber them, and the
 * inactive wrappers pass through.
 */
export declare const uninstallNetworkPatches: () => void;
export declare const installNetworkCapture: (options: NetworkCaptureOptions) => NetworkCaptureHandle;
