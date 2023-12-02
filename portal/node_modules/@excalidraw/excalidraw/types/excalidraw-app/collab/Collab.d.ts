/// <reference types="lodash" />
import { PureComponent } from "react";
import { ExcalidrawImperativeAPI } from "../../types";
import { ImportedDataState } from "../../data/types";
import { ExcalidrawElement } from "../../element/types";
import { Gesture } from "../../types";
import { SocketUpdateDataSource, SyncableExcalidrawElement } from "../data";
import Portal from "./Portal";
import { UserIdleState } from "../../types";
import { FileManager } from "../data/FileManager";
export declare const collabAPIAtom: import("jotai").Atom<CollabAPI | null> & {
    write: (get: {
        <Value>(atom: import("jotai").Atom<Value | Promise<Value>>): Value;
        <Value_1>(atom: import("jotai").Atom<Promise<Value_1>>): Value_1;
        <Value_2>(atom: import("jotai").Atom<Value_2>): Value_2 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_2;
    } & {
        <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>, options: {
            unstable_promise: true;
        }): Value_3 | Promise<Value_3>;
        <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>, options: {
            unstable_promise: true;
        }): Value_4 | Promise<Value_4>;
        <Value_5>(atom: import("jotai").Atom<Value_5>, options: {
            unstable_promise: true;
        }): (Value_5 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_5) | Promise<Value_5 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_5>;
    }, set: {
        <Value_6, Result extends void | Promise<void>>(atom: import("jotai").WritableAtom<Value_6, undefined, Result>): Result;
        <Value_7, Update, Result_1 extends void | Promise<void>>(atom: import("jotai").WritableAtom<Value_7, Update, Result_1>, update: Update): Result_1;
    }, update: CollabAPI | ((prev: CollabAPI | null) => CollabAPI | null) | null) => void;
    onMount?: (<S extends (update: CollabAPI | ((prev: CollabAPI | null) => CollabAPI | null) | null) => void>(setAtom: S) => void | (() => void)) | undefined;
} & {
    init: CollabAPI | null;
};
export declare const collabDialogShownAtom: import("jotai").Atom<boolean> & {
    write: (get: {
        <Value>(atom: import("jotai").Atom<Value | Promise<Value>>): Value;
        <Value_1>(atom: import("jotai").Atom<Promise<Value_1>>): Value_1;
        <Value_2>(atom: import("jotai").Atom<Value_2>): Value_2 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_2;
    } & {
        <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>, options: {
            unstable_promise: true;
        }): Value_3 | Promise<Value_3>;
        <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>, options: {
            unstable_promise: true;
        }): Value_4 | Promise<Value_4>;
        <Value_5>(atom: import("jotai").Atom<Value_5>, options: {
            unstable_promise: true;
        }): (Value_5 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_5) | Promise<Value_5 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_5>;
    }, set: {
        <Value_6, Result extends void | Promise<void>>(atom: import("jotai").WritableAtom<Value_6, undefined, Result>): Result;
        <Value_7, Update, Result_1 extends void | Promise<void>>(atom: import("jotai").WritableAtom<Value_7, Update, Result_1>, update: Update): Result_1;
    }, update: boolean | ((prev: boolean) => boolean)) => void;
    onMount?: (<S extends (update: boolean | ((prev: boolean) => boolean)) => void>(setAtom: S) => void | (() => void)) | undefined;
} & {
    init: boolean;
};
export declare const isCollaboratingAtom: import("jotai").Atom<boolean> & {
    write: (get: {
        <Value>(atom: import("jotai").Atom<Value | Promise<Value>>): Value;
        <Value_1>(atom: import("jotai").Atom<Promise<Value_1>>): Value_1;
        <Value_2>(atom: import("jotai").Atom<Value_2>): Value_2 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_2;
    } & {
        <Value_3>(atom: import("jotai").Atom<Value_3 | Promise<Value_3>>, options: {
            unstable_promise: true;
        }): Value_3 | Promise<Value_3>;
        <Value_4>(atom: import("jotai").Atom<Promise<Value_4>>, options: {
            unstable_promise: true;
        }): Value_4 | Promise<Value_4>;
        <Value_5>(atom: import("jotai").Atom<Value_5>, options: {
            unstable_promise: true;
        }): (Value_5 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_5) | Promise<Value_5 extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? V extends Promise<infer V> ? any : V : V : V : V : V : V : V : V : V : V : Value_5>;
    }, set: {
        <Value_6, Result extends void | Promise<void>>(atom: import("jotai").WritableAtom<Value_6, undefined, Result>): Result;
        <Value_7, Update, Result_1 extends void | Promise<void>>(atom: import("jotai").WritableAtom<Value_7, Update, Result_1>, update: Update): Result_1;
    }, update: boolean | ((prev: boolean) => boolean)) => void;
    onMount?: (<S extends (update: boolean | ((prev: boolean) => boolean)) => void>(setAtom: S) => void | (() => void)) | undefined;
} & {
    init: boolean;
};
interface CollabState {
    errorMessage: string;
    username: string;
    activeRoomLink: string;
}
declare type CollabInstance = InstanceType<typeof Collab>;
export interface CollabAPI {
    /** function so that we can access the latest value from stale callbacks */
    isCollaborating: () => boolean;
    onPointerUpdate: CollabInstance["onPointerUpdate"];
    startCollaboration: CollabInstance["startCollaboration"];
    stopCollaboration: CollabInstance["stopCollaboration"];
    syncElements: CollabInstance["syncElements"];
    fetchImageFilesFromFirebase: CollabInstance["fetchImageFilesFromFirebase"];
    setUsername: (username: string) => void;
}
interface PublicProps {
    excalidrawAPI: ExcalidrawImperativeAPI;
}
declare type Props = PublicProps & {
    modalIsShown: boolean;
};
declare class Collab extends PureComponent<Props, CollabState> {
    portal: Portal;
    fileManager: FileManager;
    excalidrawAPI: Props["excalidrawAPI"];
    activeIntervalId: number | null;
    idleTimeoutId: number | null;
    private socketInitializationTimer?;
    private lastBroadcastedOrReceivedSceneVersion;
    private collaborators;
    constructor(props: Props);
    componentDidMount(): void;
    componentWillUnmount(): void;
    isCollaborating: () => boolean;
    private setIsCollaborating;
    private onUnload;
    private beforeUnload;
    saveCollabRoomToFirebase: (syncableElements: readonly SyncableExcalidrawElement[]) => Promise<void>;
    stopCollaboration: (keepRemoteState?: boolean) => void;
    private destroySocketClient;
    private fetchImageFilesFromFirebase;
    private decryptPayload;
    private fallbackInitializationHandler;
    startCollaboration: (existingRoomLinkData: null | {
        roomId: string;
        roomKey: string;
    }) => Promise<ImportedDataState | null>;
    private initializeRoom;
    private reconcileElements;
    private loadImageFiles;
    private handleRemoteSceneUpdate;
    private onPointerMove;
    private onVisibilityChange;
    private reportIdle;
    private reportActive;
    private initializeIdleDetector;
    setCollaborators(sockets: string[]): void;
    setLastBroadcastedOrReceivedSceneVersion: (version: number) => void;
    getLastBroadcastedOrReceivedSceneVersion: () => number;
    getSceneElementsIncludingDeleted: () => readonly ExcalidrawElement[];
    onPointerUpdate: import("lodash").DebouncedFunc<(payload: {
        pointer: SocketUpdateDataSource["MOUSE_LOCATION"]["payload"]["pointer"];
        button: SocketUpdateDataSource["MOUSE_LOCATION"]["payload"]["button"];
        pointersMap: Gesture["pointers"];
    }) => void>;
    onIdleStateChange: (userState: UserIdleState) => void;
    broadcastElements: (elements: readonly ExcalidrawElement[]) => void;
    syncElements: (elements: readonly ExcalidrawElement[]) => void;
    queueBroadcastAllElements: import("lodash").DebouncedFunc<() => void>;
    queueSaveToFirebase: import("lodash").DebouncedFunc<() => void>;
    handleClose: () => void;
    setUsername: (username: string) => void;
    onUsernameChange: (username: string) => void;
    render(): JSX.Element;
}
declare global {
    interface Window {
        collab: InstanceType<typeof Collab>;
    }
}
declare const _Collab: React.FC<PublicProps>;
export default _Collab;
export declare type TCollabClass = Collab;
