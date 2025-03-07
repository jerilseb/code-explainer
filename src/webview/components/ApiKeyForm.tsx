import * as React from 'react';
import { useState } from 'react';
import '../style.css';

interface Props {
  onSubmit: (apiKey: string) => void;
  isChangingKey?: boolean;
}

const ApiKeyForm: React.FC<Props> = ({ onSubmit, isChangingKey = false }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (apiKeyInput.trim()) {
      onSubmit(apiKeyInput);
      setApiKeyInput('');
    }
  };

  return (
    <div className="api-key-form">
      {!isChangingKey && (
        <>
          <h3>Set Your OpenAI API Key</h3>
          <p>
            To use this extension, you need to provide your OpenAI API key. 
            Your key will be stored securely in VS Code's secret storage.
          </p>
        </>
      )}
      <p>
        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
          Get your API key from OpenAI
        </a>
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="apiKey">OpenAI API Key:</label>
        <input
          type="password"
          id="apiKey"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder="sk-..."
          required
          className="api-key-input"
        />
        <button type="submit" className="submit-button">
          {isChangingKey ? 'Update API Key' : 'Set API Key'}
        </button>
      </form>
    </div>
  );
};

export default ApiKeyForm;