export {};
declare global {
    const vscode: {
        postMessage: (message: any) => void;
        getState: () => any;
        setState: (state: any) => void;
    };
}