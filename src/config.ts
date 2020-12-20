// node
import path from 'path';
import fs from 'fs';
// utils
import { ErrorType, message } from './utils/message';

interface Config {
  fullErrors: boolean;
  noWarnings: boolean;
}

let config: Config = {
  fullErrors: false,
  noWarnings: false,
};

const configPath: string = path.join(process.cwd(), 'regez.config.json');

if (fs.existsSync(configPath)) {
  const jsonString = fs.readFileSync(configPath, 'utf-8');

  try {
    const parsedJson: Config = JSON.parse(jsonString);
    config = { ...config, ...parsedJson };
  } catch (err) {
    message('Error', ErrorType.INVALID_CONFIG);
  }
}

export default config;
