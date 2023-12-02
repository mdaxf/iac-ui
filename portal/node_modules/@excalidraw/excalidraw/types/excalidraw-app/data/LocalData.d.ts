/**
 * This file deals with saving data state (appState, elements, images, ...)
 * locally to the browser.
 *
 * Notes:
 *
 * - DataState refers to full state of the app: appState, elements, images,
 *   though some state is saved separately (collab username, library) for one
 *   reason or another. We also save different data to different sotrage
 *   (localStorage, indexedDB).
 */
import { ExcalidrawElement, FileId } from "../../element/types";
import { AppState, BinaryFiles } from "../../types";
import { FileManager } from "./FileManager";
declare class LocalFileManager extends FileManager {
    clearObsoleteFiles: (opts: {
        currentFileIds: FileId[];
    }) => Promise<void>;
}
declare type SavingLockTypes = "collaboration";
export declare class LocalData {
    private static _save;
    /** Saves DataState, including files. Bails if saving is paused */
    static save: (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles, onFilesSaved: () => void) => void;
    static flushSave: () => void;
    private static locker;
    static pauseSave: (lockType: SavingLockTypes) => void;
    static resumeSave: (lockType: SavingLockTypes) => void;
    static isSavePaused: () => boolean;
    static fileStorage: LocalFileManager;
}
export {};
