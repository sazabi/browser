import { type ClientEvent } from "./client-sdk-core/index.js";
export interface ErrorCaptureOptions {
    emit(event: ClientEvent): void;
}
export interface ErrorCaptureHandle {
    teardown(): void;
}
export declare const installErrorCapture: (options: ErrorCaptureOptions) => ErrorCaptureHandle;
