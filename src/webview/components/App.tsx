import * as React from 'react';
import { useState, useEffect } from 'react';
import ApiKeyForm from './ApiKeyForm';
import ExplanationDisplay from './ExplanationDisplay';
import type { Message, SelectedCodeMessage, StreamChunkMessage, StreamCompleteMessage, StreamErrorMessage, ApiKeySetMessage, Model, ModelSetMessage } from '../../types';

declare const vscode: any;

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCode, setSelectedCode] = useState('');
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>('o3-mini');

  useEffect(() => {
    // Check if API key is already set
    setIsCheckingApiKey(true);
    vscode.postMessage({ command: 'checkApiKey' });

    const handleMessageEvent = (event: MessageEvent) => {
      const message: Message = event.data;
      console.log("message from extension");
      console.log(message);
      switch (message.command) {
        case 'apiKeySet':
          setApiKey((message as ApiKeySetMessage).apiKey);
          setShowApiKeyForm(false);
          setIsCheckingApiKey(false);
          break;
        case 'streamChunk':
          appendExplanation((message as StreamChunkMessage).chunk);
          break;
        case 'streamComplete':
          setLoading(false);
          break;
        case 'streamError':
          setLoading(false);
          setExplanation(`Error: ${(message as StreamErrorMessage).error}`);
          break;
        case 'setSelectedCode':
          console.log("Setting selected code " + (message as SelectedCodeMessage).code);
          setSelectedCode((message as SelectedCodeMessage).code);
          // Now that code and apiKey are available lets request explanation.
          if (apiKey) {
            handleExplainCode();
          }
          break;
        case 'modelSet':
          setSelectedModel((message as ModelSetMessage).model);
          break;
      }
    };

    window.addEventListener('message', handleMessageEvent);
    return () => window.removeEventListener('message', handleMessageEvent);
  }, [apiKey, selectedCode]); // Add selectedCode to dependency array

  const handleApiKeySubmit = (key: string) => {
    vscode.postMessage({
      command: 'setApiKey',
      apiKey: key,
    });
  };

  const handleModelChange = (model: Model) => {
    vscode.postMessage({
      command: 'setModel',
      model: model,
    });
  };

  const handleExplainCode = () => {
    setExplanation('');
    setLoading(true);
    vscode.postMessage({ command: 'explainCode' });
  };

  const appendExplanation = (chunk: string) => {
    setExplanation((prevExplanation) => prevExplanation + chunk);
  };

  const toggleApiKeyForm = () => {
    setShowApiKeyForm(!showApiKeyForm);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    if (showApiKeyForm) {
      setShowApiKeyForm(false);
    }
  };

  // Welcome message component
  const WelcomeMessage = () => (
    <div className="welcome-container">
      <h2>Welcome to Code Explanation</h2>
      <p>This extension helps you understand code by providing explanations using OpenAI.</p>
      <h3>How to use:</h3>
      <ol>
        <li>Set your OpenAI API in the settings</li>
        <li>Select code in the editor</li>
        <li>Right-click and choose "Explain Code" from the context menu</li>
      </ol>
    </div>
  );

  // API Key Settings component
  const ApiKeySettings = () => (
    <div className="settings-section">
      <h3>API Key Configuration</h3>
      <div className="api-key-status">
        <span>API Key: </span>
        <span className="api-key-masked">••••••••••••••••••••••</span>
        <button
          className="change-button"
          onClick={toggleApiKeyForm}
        >
          {showApiKeyForm ? 'Cancel' : 'Change API Key'}
        </button>
      </div>
      {showApiKeyForm && (
        <div className="api-key-change-form">
          <ApiKeyForm onSubmit={handleApiKeySubmit} isChangingKey={true} />
        </div>
      )}
    </div>
  );

  // Model Settings component
  const ModelSettings = () => (
    <div className="settings-section">
      <h3>Model Configuration</h3>
      <div className="model-selection">
        <span>Model: </span>
        <select 
          value={selectedModel}
          onChange={(e) => handleModelChange(e.target.value as Model)}
          className="model-select"
        >
          <option value="o3-mini">o3-mini</option>
          <option value="gpt-4o">gpt-4o</option>
        </select>
      </div>
    </div>
  );

  // Settings view component
  const SettingsView = () => (
    <div className="settings-overlay">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={toggleSettings}>×</button>
        </div>
        <div className="settings-body">
          <ApiKeySettings />
          <ModelSettings />
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="app-header">
        {apiKey && (
          <button className="settings-button" onClick={toggleSettings}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13C11.6569 13 13 11.6569 13 10C13 8.34315 11.6569 7 10 7C8.34315 7 7 8.34315 7 10C7 11.6569 8.34315 13 10 13Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M17.6569 11.2497L16.2426 9.83547C16.1517 9.74459 16.1053 9.62503 16.1053 9.50047V8.49953C16.1053 8.37497 16.1517 8.25541 16.2426 8.16453L17.6569 6.75031C18.0474 6.35979 18.1141 5.74791 17.8241 5.28765L16.7759 3.54235C16.4859 3.08209 15.9003 2.89365 15.3861 3.08165L13.6861 3.69165C13.5699 3.73084 13.4416 3.71772 13.3347 3.65547C13.0251 3.47772 12.6959 3.32772 12.3524 3.20772C12.2364 3.16697 12.1451 3.07572 12.1053 2.95959L11.5053 1.25959C11.3223 0.739404 10.8337 0.400024 10.2859 0.400024H8.19531C7.64753 0.400024 7.15893 0.739404 6.97593 1.25959L6.37593 2.95959C6.33612 3.07572 6.24487 3.16697 6.12881 3.20772C5.78537 3.32772 5.45612 3.47772 5.14656 3.65547C5.03968 3.71772 4.91143 3.73084 4.79518 3.69165L3.09518 3.08165C2.58093 2.89365 1.99537 3.08209 1.70537 3.54235L0.657181 5.28765C0.367181 5.74791 0.433868 6.35979 0.824368 6.75031L2.23862 8.16453C2.32949 8.25541 2.37593 8.37497 2.37593 8.49953V9.50047C2.37593 9.62503 2.32949 9.74459 2.23862 9.83547L0.824368 11.2497C0.433868 11.6402 0.367181 12.2521 0.657181 12.7124L1.70537 14.4577C1.99537 14.9179 2.58093 15.1064 3.09518 14.9184L4.79518 14.3084C4.91143 14.2692 5.03968 14.2823 5.14656 14.3445C5.45612 14.5223 5.78537 14.6723 6.12881 14.7923C6.24487 14.833 6.33612 14.9243 6.37593 15.0404L6.97593 16.7404C7.15893 17.2606 7.64753 17.6 8.19531 17.6H10.2859C10.8337 17.6 11.3223 17.2606 11.5053 16.7404L12.1053 15.0404C12.1451 14.9243 12.2364 14.833 12.3524 14.7923C12.6959 14.6723 13.0251 14.5223 13.3347 14.3445C13.4416 14.2823 13.5699 14.2692 13.6861 14.3084L15.3861 14.9184C15.9003 15.1064 16.4859 14.9179 16.7759 14.4577L17.8241 12.7124C18.1141 12.2521 18.0474 11.6402 17.6569 11.2497Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        )}
      </div>
      {showSettings && <SettingsView />}
      {isCheckingApiKey ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {!apiKey && (
            <>
              <WelcomeMessage />
              <ApiKeyForm onSubmit={handleApiKeySubmit} />
            </>
          )}
          {apiKey && !selectedCode && (
            <WelcomeMessage />
          )}
          {apiKey && selectedCode && (
            <ExplanationDisplay
              explanation={explanation}
              loading={loading}
              onChangeApiKey={() => {
                toggleSettings();
                setShowApiKeyForm(true);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;