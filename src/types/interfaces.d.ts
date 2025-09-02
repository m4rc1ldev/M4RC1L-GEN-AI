// Interfaces for the two main experiences

export interface M4RC1LInterface {
  // Current selected model id
  model: string;
  // Send a message to chat stream
  send(content: string): Promise<void>;
}

export interface ImageGenInterface {
  // Generate an image URL from a text prompt
  generate(prompt: string, opts?: { ratio?: string; style?: string }): Promise<string>;
}
