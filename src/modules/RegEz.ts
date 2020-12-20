// config
import config from '../config';
// modules
import Block from './Block';
// utils
import { neutralizeSpecialChars } from '../utils/neutralize-special-chars';
import { message, ErrorType } from '../utils/message';
import { suggest } from '../utils/suggest';

// types
type Flag =
  | 'global'
  | 'insensitive'
  | 'multi-line'
  | 'single-line'
  | 'unicode'
  | 'sticky';

/**
 * Creates a RegExp object.
 * @param blocks Blocks of type "Block" or "string".
 * @param flags The flags you want to add to the regular expression.
 * - **g**lobal - For all matches.
 * - **i**nsensitive - For case-insensitivity.
 * - **m**ultiLine - **caret^** and **dollar sign$** at the begin/end of each line. See [this](https://javascript.info/regexp-multiline-mode).
 * - **s**ingleLine - **Dot.** for **newline\n** characters. See [this](https://javascript.info/regexp-character-classes).
 * - **u**nicode - For full Unicode support. See [this](https://javascript.info/regexp-unicode).
 * - stick**y** - For searching at the exact position in the text. See [this](https://javascript.info/regexp-sticky).
 *
 * To know more about flags see [this](https://javascript.info/regexp-introduction).
 */
export default function RegEz(
  blocks: any[],
  flags: Flag[] = [],
  startOfLine: boolean = false,
  endOfLine: boolean = false
): RegExp {
  const fullErrors: boolean =
    typeof config.fullErrors === 'boolean' ? config.fullErrors : false;

  const stringFlags: string = flags.length
    ? processFlags(flags, fullErrors)
    : '';

  let stringBlocks: string = processNestedBlocks(blocks, true);

  if (startOfLine) stringBlocks = '^' + stringBlocks;
  if (endOfLine) stringBlocks += '$';

  return new RegExp(stringBlocks, stringFlags);
}

function processFlags(flags: Flag[], fullErrors: boolean): string {
  let flagsArray: Set<Flag> = new Set(flags);

  let flagsString: string = '';
  flagsArray.forEach((flag) => {
    switch (flag) {
      case 'global':
        flagsString += 'g';
        break;
      case 'insensitive':
        flagsString += 'i';
        break;
      case 'multi-line':
        flagsString += 'm';
        break;
      case 'single-line':
        flagsString += 's';
        break;
      case 'unicode':
        flagsString += 'u';
        break;
      case 'sticky':
        flagsString += 'y';
        break;
      default:
        const suggestion = suggest(flag, [
          'global',
          'insensitive',
          'multi-line',
          'single-line',
          'unicode',
          'sticky',
        ]);

        message(
          'Error',
          ErrorType.BAD_FLAG,
          [`"${flag}" is not a valid flag.`],
          [`Did you mean "${suggestion}"?`]
        );
    }
  });

  // test flags
  // if success, return flags
  // if fail, return empty
  try {
    new RegExp('', flagsString);
    return flagsString;
  } catch (err) {
    if (!fullErrors)
      message(
        'Error',
        ErrorType.BAD_FLAG,
        ['Could not find the reason.'],
        ['All flags are ignored in the final result.']
      );
    else throw new Error(err);
  }

  return '';
}

function getStringBlock(block: Block | string): string {
  if (typeof block === 'string') return neutralizeSpecialChars(block);
  else if (block.stringResult) return block.stringResult;
  else
    message('Error', ErrorType.BAD_BLOCK, [`"${block}" is not a valid block.`]);

  return '';
}

function processNestedBlocks(
  nestedBlocks: any[],
  isMainArray: boolean = false
): string {
  let out: string = '';
  let numberOfExtracts: number = 0;

  for (let i = 0; i < nestedBlocks.length; i++)
    if (Array.isArray(nestedBlocks[i]))
      out += processNestedBlocks(nestedBlocks[i]);
    else {
      numberOfExtracts++;
      out += getStringBlock(nestedBlocks[i]);
    }

  // don't put parenthesis for the main array
  if (isMainArray) return out;
  // don't put unnecessary parenthesis
  if (numberOfExtracts) return `(${out})`;
  return out;
}
