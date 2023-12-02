import { AppState } from "../types";
import { NonDeletedExcalidrawElement } from "../element/types";
declare type Props = {
    setToast: (message: string) => void;
    elements: readonly NonDeletedExcalidrawElement[];
    appState: AppState;
};
declare const CustomStats: (props: Props) => JSX.Element;
export default CustomStats;
