export declare const WRAPPED_MARKER = "__sazabiBrowserWrapped";
/** Best-effort idempotency marker on wrapper functions. */
export declare const markWrapped: (fn: object) => void;
export declare const isWrapped: (fn: unknown) => boolean;
