import { ActionManager } from "../actions/manager";
import { AppState } from "../types";
import "./WelcomeScreen.scss";
declare const WelcomeScreen: ({ appState, actionManager, }: {
    appState: AppState;
    actionManager: ActionManager;
}) => JSX.Element;
export default WelcomeScreen;
