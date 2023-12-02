import React from "react";
import { NonDeletedExcalidrawElement } from "../../element/types";
import { AppState, BinaryFiles } from "../../types";
export declare const ExportToExcalidrawPlus: React.FC<{
    elements: readonly NonDeletedExcalidrawElement[];
    appState: AppState;
    files: BinaryFiles;
    onError: (error: Error) => void;
}>;
