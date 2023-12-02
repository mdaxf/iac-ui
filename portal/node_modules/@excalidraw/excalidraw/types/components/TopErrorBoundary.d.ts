import React from "react";
interface TopErrorBoundaryState {
    hasError: boolean;
    sentryEventId: string;
    localStorage: string;
}
export declare class TopErrorBoundary extends React.Component<any, TopErrorBoundaryState> {
    state: TopErrorBoundaryState;
    render(): any;
    componentDidCatch(error: Error, errorInfo: any): void;
    private selectTextArea;
    private createGithubIssue;
    private errorSplash;
}
export {};
