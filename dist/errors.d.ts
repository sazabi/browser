import type { WebEvent } from "./types";
export interface ErrorCaptureOptions {
    emit(event: WebEvent): void;
}
export interface ErrorCaptureHandle {
    teardown(): void;
}
export declare const installErrorCapture: (options: ErrorCaptureOptions) => ErrorCaptureHandle;
