const COLORS = {
  OFF: '\u001b[0m',
  MAGENTA: '\u001b[35m',
  RED: '\u001b[31m',
  YELLOW: '\u001b[33m',
};

export enum ErrorType {
  BAD_FLAG = 'Bad Flag',
  BAD_RANGE = 'Bad Range',
  BAD_REPEAT = 'Bad Repeat',
  BAD_GROUP = 'Bad Group',
  BAD_BLOCK = 'Bad Block',
  BAD_BLOCK_TYPE = 'Bad Block Type',
  BAD_METHOD_CALL = 'Bad Method Call',
  INVALID_CONFIG = 'Invalid Config',
}

export enum WarningType {
  UNNECESSARY_GROUP = 'Unnecessary Group',
  UNNECESSARY_METHOD_CALL = 'Unnecessary Method Call',
}

export function message(
  type: 'Error' | 'Warning',
  title: ErrorType | WarningType,
  message: string[] = [],
  description: string[] = []
): void {
  if (type === 'Error')
    switch (title) {
      case ErrorType.BAD_RANGE:
        message.push(
          'Module "Block" >> Method "range" >> Params "from" and "to".'
        );
        description.push('Ignored in the final result.');
        break;
      case ErrorType.BAD_FLAG:
        message.push('Module "RegEz" >> Param "flags".');
        description.push('Ignored in the final result.');
        break;
      case ErrorType.BAD_GROUP:
        message.push('Module "Block" >> Method "all" >> Param "charGroups".');
        description.push('Ignored in the final result.');
        break;
      case ErrorType.BAD_GROUP:
        message.push('Module "Block" >> Method "repeats" >> Param "times".');
        description.push('Ignored in the final result.');
        break;
      case ErrorType.BAD_BLOCK:
        message.push('Module "RegEz" >> Param "blocks".');
        description.push('Ignored in the final result.');
        break;
      case ErrorType.BAD_BLOCK_TYPE:
        message.push('Module "Block" >> Param "blockType".');
        description.push('Considered as a literal block.');
        break;
      case ErrorType.INVALID_CONFIG:
        message.push('"regez.config.json" is not a valid JSON.');
    }
  else
    switch (title) {
      case WarningType.UNNECESSARY_GROUP:
        message.push('Module "Block" >> Method "all" >> Param "charGroups".');
        break;
    }

  const MESSAGE_COLOR = type === 'Error' ? COLORS.RED : COLORS.YELLOW;

  let result: string = `${COLORS.MAGENTA}| RegEz Sweet ${type} ${
    type === 'Error' ? '🍵' : '☕'
  } ${MESSAGE_COLOR}${title}${COLORS.MAGENTA}\n`;

  if (message.length)
    for (let i = 0; i < message.length; i++)
      result += `| ${MESSAGE_COLOR}> ${message[i]}${COLORS.MAGENTA}\n`;

  if (description.length)
    for (let i = 0; i < description.length; i++)
      result += `| > ${COLORS.MAGENTA}${description[i]}\n`;

  result = result.trim() + COLORS.OFF;
  console.log(result);
}
