import JoyCon from 'joycon';
import YAML from 'yaml';

const joycon = new JoyCon();

joycon.addLoader({
  test: /^\.(yaml|yml)$/,
  load(filepath) {
    return YAML.parse(filepath);
  },
});

const defaultConfig: Options = {
  debugger: false,
};

export async function loadConfig(cwd: string): Promise<Options> {
  const acceptedExtentions = Object.freeze(['json', 'js', 'ts', 'yaml', 'yml']);

  const config = await joycon.load(
    acceptedExtentions.map((ext) => `regez.config.${ext}`),
    cwd
  );

  return { ...defaultConfig, ...config.data };
}

interface Options {
  debugger: boolean;
}
