export type Command = 'alert' | 'setApiKey' | 'apiKeySet' | 'streamChunk' | 'streamComplete' | 'streamError' | 'setSelectedCode' | 'explainCode' | 'setModel' | 'modelSet';

export type Model = 'gpt4o' | 'o3-mini';

export interface Message {
    command: Command;
    text?: string;  // Optional, used by 'alert'
}

export interface ApiKeySetMessage extends Message {
    command: 'apiKeySet';
    apiKey: string;
}
export interface StreamChunkMessage extends Message {
  command: 'streamChunk';
  chunk: string;
}

export interface StreamCompleteMessage extends Message {
  command: 'streamComplete';
}

export interface StreamErrorMessage extends Message {
  command: 'streamError';
  error: string;
}

export interface SelectedCodeMessage extends Message {
    command: 'setSelectedCode';
    code: string;
}

export interface SetModelMessage extends Message {
    command: 'setModel';
    model: Model;
}

export interface ModelSetMessage extends Message {
    command: 'modelSet';
    model: Model;
}