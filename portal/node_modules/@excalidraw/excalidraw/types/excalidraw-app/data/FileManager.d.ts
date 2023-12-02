import { ExcalidrawElement, FileId, InitializedExcalidrawImageElement } from "../../element/types";
import { BinaryFileData, ExcalidrawImperativeAPI, BinaryFiles } from "../../types";
export declare class FileManager {
    /** files being fetched */
    private fetchingFiles;
    /** files being saved */
    private savingFiles;
    private savedFiles;
    private erroredFiles;
    private _getFiles;
    private _saveFiles;
    constructor({ getFiles, saveFiles, }: {
        getFiles: (fileIds: FileId[]) => Promise<{
            loadedFiles: BinaryFileData[];
            erroredFiles: Map<FileId, true>;
        }>;
        saveFiles: (data: {
            addedFiles: Map<FileId, BinaryFileData>;
        }) => Promise<{
            savedFiles: Map<FileId, true>;
            erroredFiles: Map<FileId, true>;
        }>;
    });
    /**
     * returns whether file is already saved or being processed
     */
    isFileHandled: (id: FileId) => boolean;
    isFileSaved: (id: FileId) => boolean;
    saveFiles: ({ elements, files, }: {
        elements: readonly ExcalidrawElement[];
        files: BinaryFiles;
    }) => Promise<{
        savedFiles: Map<FileId, true>;
        erroredFiles: Map<FileId, true>;
    }>;
    getFiles: (ids: FileId[]) => Promise<{
        loadedFiles: BinaryFileData[];
        erroredFiles: Map<FileId, true>;
    }>;
    /** a file element prevents unload only if it's being saved regardless of
     *  its `status`. This ensures that elements who for any reason haven't
     *  beed set to `saved` status don't prevent unload in future sessions.
     *  Technically we should prevent unload when the origin client haven't
     *  yet saved the `status` update to storage, but that should be taken care
     *  of during regular beforeUnload unsaved files check.
     */
    shouldPreventUnload: (elements: readonly ExcalidrawElement[]) => boolean;
    /**
     * helper to determine if image element status needs updating
     */
    shouldUpdateImageElementStatus: (element: ExcalidrawElement) => element is InitializedExcalidrawImageElement;
    reset(): void;
}
export declare const encodeFilesForUpload: ({ files, maxBytes, encryptionKey, }: {
    files: Map<FileId, BinaryFileData>;
    maxBytes: number;
    encryptionKey: string;
}) => Promise<{
    id: FileId;
    buffer: Uint8Array;
}[]>;
export declare const updateStaleImageStatuses: (params: {
    excalidrawAPI: ExcalidrawImperativeAPI;
    erroredFiles: Map<FileId, true>;
    elements: readonly ExcalidrawElement[];
}) => void;
