import JoyCon from 'joycon';
import * as YAML from 'yaml';
import fs from 'fs';

const joycon = new JoyCon();

joycon.addLoader({
  test: /\.(yaml|yml)$/,
  load(filepath) {
    return YAML.parse(fs.readFileSync(filepath, 'utf-8'));
  },
});

const defaultConfig: Options = {
  debugger: false,
};

export async function loadConfig(cwd: string): Promise<Options> {
  const acceptedExtentions = Object.freeze(['yaml', 'yml', 'ts', 'js', 'json']);

  const config = await joycon.load(
    acceptedExtentions.map((ext) => `regez.config.${ext}`),
    cwd
  );

  return { ...defaultConfig, ...config.data };
}

interface Options {
  debugger: boolean;
}
