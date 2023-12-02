import { PRECEDING_ELEMENT_KEY } from "../../constants";
import { ExcalidrawElement } from "../../element/types";
import { AppState } from "../../types";
export declare type ReconciledElements = readonly ExcalidrawElement[] & {
    _brand: "reconciledElements";
};
export declare type BroadcastedExcalidrawElement = ExcalidrawElement & {
    [PRECEDING_ELEMENT_KEY]?: string;
};
export declare const reconcileElements: (localElements: readonly ExcalidrawElement[], remoteElements: readonly BroadcastedExcalidrawElement[], localAppState: AppState) => ReconciledElements;
