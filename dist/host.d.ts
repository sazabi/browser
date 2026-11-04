import { type SessionStore } from "./client-sdk-core/index.js";
/**
 * Storage access that degrades to in-memory when storage is unavailable
 * (Safari private mode, disabled cookies, sandboxed iframes). A degraded
 * session is per-page rather than cross-tab, an acceptable fallback.
 */
export declare const createSafeStorage: (getStore: () => Storage) => SessionStore;
/** Absolute request URL as the page resolves it, credentials stripped. */
export declare const resolveUrl: (raw: string) => string | undefined;
export declare const isSameOrigin: (resolved: string) => boolean;
export declare const isOffline: () => boolean;
/**
 * React Native aliases `window` to its global, so the server-side guard in
 * init() passes there; without this check the SDK would reach the DOM and
 * throw into the host. The mobile SDK is `@sazabi/react-native`.
 */
export declare const isReactNativeHost: () => boolean;
