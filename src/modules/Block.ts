// config
import config from '../config';
// utils
import { neutralizeSpecialChars } from '../utils/neutralize-special-chars';
import { ErrorType, message, WarningType } from '../utils/message';
import { suggest } from '../utils/suggest';

// types
type BlockType = 'literal' | 'single-char';

type CharGroup =
  | 'lowers'
  | 'uppers'
  | 'letters'
  | 'digits'
  | 'non-digits'
  | 'wordlies'
  | 'non-wordlies'
  | 'spaces'
  | 'non-spaces'
  | 'everything';

type RepeatsTimes = 'zero-or-one' | 'zero-or-more' | 'one-or-more';

export class Block {
  // constructor
  private blockType: BlockType;
  // options
  private fullErrors: boolean = false;
  private noWarnings: boolean = false;

  // repeats
  private repeating: string = '';

  // results
  private literalResult: string = '';
  stringResult: string = '';
  regExpResult: RegExp = new RegExp('');

  //! ________________ constructor ________________

  /**
   *
   * @param blockType Type of the block:
   * - ***literal -*** Match the characters literally considering the order. Actually **\/.../**.
   * - ***single-char -*** Match any of the characters. Actually **\/[...]/**.
   */
  constructor(blockType: BlockType = 'literal') {
    this.blockType = blockType;
    this.fullErrors =
      typeof config.fullErrors === 'boolean' ? config.fullErrors : false;
    this.noWarnings =
      typeof config.noWarnings === 'boolean' ? config.noWarnings : false;
  }

  //! ________________ create results ________________

  private generateResults(value?: string): void {
    if (value) this.literalResult += value;

    if (this.blockType === 'single-char')
      this.stringResult = '[' + this.literalResult + ']' + this.repeating;
    else {
      if (this.blockType !== 'literal')
        message('Error', ErrorType.BAD_BLOCK_TYPE, [
          `"${this.blockType}" is not a valid block type.`,
        ]);

      this.stringResult = this.literalResult;
    }

    this.regExpResult = new RegExp(this.stringResult);
  }

  //! ________________ except ________________

  except(): this {
    if (this.blockType === 'single-char') {
      if (!this.literalResult.startsWith('^')) {
        this.literalResult = '^' + this.literalResult;
      } else if (!this.noWarnings)
        message('Warning', WarningType.UNNECESSARY_METHOD_CALL, [
          'Do not use method "except" more than once. Module "Block" >> Method "except".',
        ]);
    } else
      message('Error', ErrorType.BAD_METHOD_CALL, [
        'Cannot use "except" for a literal block. Module "Block" >> Method "except".',
      ]);

    this.generateResults();

    this.regExpResult = new RegExp(this.stringResult);

    return this;
  }

  //! ________________ repeats ________________

  /**
   * The times the characters repeat.
   *
   * **Note:** This only affects "single-char" blocks.
   *
   * **Note:** Don't use options together. You can only use "atLeast" and "atMost" together; Else, the more important one will be considered.
   *
   * _Options by importance: times > exactly > atLeast = atMost_.
   * @param times Special quantifiers:
   * - ***zero-or-one -*** Match one character or nothing. Actually **\/[...]?/**.
   * - ***zero-or-more -*** Match unlimited length of characters or nothing. Actually **\/[...]\*\/**.
   * - ***one-or-more -*** Match at least one character. Actually **\/[...]+/**.
   * @param exactly Exact number of repeats.
   * @param atLeast Minimum number of repeats.
   * @param atMost Maximum number of repeats.
   */
  repeats({
    times,
    exactly,
    atLeast,
    atMost,
  }: {
    times?: RepeatsTimes;
    exactly?: number;
    atLeast?: number;
    atMost?: number;
  }): this {
    if (times)
      switch (times) {
        case 'zero-or-one':
          this.repeating = '?';
          break;
        case 'zero-or-more':
          this.repeating = '*';
          break;
        case 'one-or-more':
          this.repeating = '+';
          break;
        default:
          const suggestion = suggest(times, [
            'zero-or-one',
            'zero-or-more',
            'one-or-more',
          ]);

          message(
            'Error',
            ErrorType.BAD_REPEAT,
            [`"${times}" is not valid.`],
            [`Did you mean "${suggestion}"?`]
          );
          break;
      }
    else if (exactly) this.repeating = '{' + exactly + '}';
    else if (atLeast && !atMost) this.repeating = '{' + atLeast + ',}';
    else if (atMost && !atLeast) this.repeating = '{,' + atMost + '}';
    else if (atMost && atLeast)
      this.repeating = '{' + atLeast + ',' + atMost + '}';
    else message('Error', ErrorType.BAD_REPEAT);

    this.generateResults();

    return this;
  }

  //! ________________ chars ________________

  /**
   * Adds characters to the block.
   * @param chars Match these characters literally.
   */
  chars(chars: string): this {
    // remove duplicates
    chars = [...new Set(chars)].join('');

    // neutralize special characers
    chars = neutralizeSpecialChars(chars);

    // generate results
    this.generateResults(chars);

    return this;
  }

  //! ________________ range ________________

  /**
   * Adds a range of characters to the block.
   * @param from Beginning of the range.
   * @param to End of the range.
   */
  range(from: string | number, to: string | number): this {
    // convert to string
    [from, to] = [from.toString(), to.toString()];

    if (!from || !to)
      message('Error', ErrorType.BAD_RANGE, [
        'The arguments of method "range" cannot be empty.',
      ]);
    else if (from.trim() !== from || to.trim() !== to)
      message('Error', ErrorType.BAD_RANGE, [
        'The arguments of method "range" cannot include spaces.',
      ]);
    else if (from.length > 1 || to.length > 1)
      message('Error', ErrorType.BAD_RANGE, [
        'The arguments of method "range" must be exactly one character.',
      ]);
    else
      try {
        new RegExp(`[${from}-${to}]`);
        this.generateResults(`${from}-${to}`);
      } catch (err) {
        // check if the range is reverse
        // if yes, show the error to fix
        // else, unknown error
        try {
          new RegExp(`[${to}-${from}]`);
          if (!this.fullErrors)
            message(
              'Error',
              ErrorType.BAD_RANGE,
              [`"${from}-${to}" is not a valid range.`],
              ['Swap "from" and "to".']
            );
          else throw new Error(err);
        } catch (err) {
          if (!this.fullErrors)
            message(
              'Error',
              ErrorType.BAD_RANGE,
              [`"${from}-${to}" is not a valid range.`],
              [
                'Could not find the reason.\nEnable "fullErrors" to see the actual error.',
              ]
            );
          else throw new Error(err);
        }
      }

    return this;
  }

  //! ________________ all ________________

  /**
   * Adds perfect character ranges to the block.
   * @param groups Perfect character ranges:
   * - ***lowers -*** All lowercase characters from "a" to "z". Actually **[a-z]**.
   * - ***uppers -*** All uppercase characters from "A" to "Z". Actually **[A-Z]**.
   * - ***letters -*** The combination of "lowers" and "uppers". Actually **[a-zA-Z]**.
   * - ***digits -*** All decimal digits from "0" to "9". Actually **[\d]**. Equivalent to **[0-9]**.
   * - ***non-digits -*** Everything but digits. Actually **[\D]**.
   * - ***wordlies -*** All wordly characters. The combination of "lowers", "uppers", "digits" and underscore\_ character. Actually **[\w]**. Equivalent to **[a-zA-Z0-9_]**.
   * - ***non-wordlies -*** Everything but wordly characters. Acrually **[\W]**.
   * - ***spaces -*** The **whitespace\s** character. Actually **[\s]**.
   * - ***non-spaces -*** Everything but whitespaces. Actually **[\S]**.
   * - ***everything -*** All characters. Actually **[.]**.
   */
  all(...charGroups: CharGroup[]): this {
    interface GroupNameRangesType {
      name: CharGroup;
      range: string;
      unnecessaries?: CharGroup[];
    }

    const GROUP_NAMES_RANGES: GroupNameRangesType[] = [
      { name: 'lowers', range: 'a-z' },
      { name: 'uppers', range: 'A-Z' },
      {
        name: 'letters',
        range: 'a-zA-Z',
        unnecessaries: ['uppers', 'lowers'],
      },
      { name: 'digits', range: '\\d' },
      {
        name: 'non-digits',
        range: '\\D',
        unnecessaries: ['letters', 'lowers', 'uppers', 'spaces'],
      },
      {
        name: 'wordlies',
        range: '\\w',
        unnecessaries: ['letters', 'uppers', 'lowers', 'digits'],
      },
      {
        name: 'non-wordlies',
        range: '\\W',
        unnecessaries: ['spaces'],
      },
      { name: 'spaces', range: '\\s' },
      {
        name: 'non-spaces',
        range: '\\S',
        unnecessaries: [
          'digits',
          'letters',
          'lowers',
          'non-digits',
          'non-wordlies',
          'uppers',
          'wordlies',
        ],
      },
      {
        name: 'everything',
        range: '.',
        unnecessaries: [
          'digits',
          'letters',
          'lowers',
          'non-digits',
          'non-spaces',
          'non-wordlies',
          'spaces',
          'uppers',
          'wordlies',
        ],
      },
    ];

    // create a set and remove duplicates
    const groups: Set<CharGroup> = new Set(charGroups);

    // find group from the list
    groups.forEach((group) => {
      const groupObj: GroupNameRangesType | undefined = GROUP_NAMES_RANGES.find(
        (cg) => cg.name === group
      );

      // check if group name is valid
      if (groupObj) {
        // check for warnings
        if (!this.noWarnings) {
          // check if using opposites together
          // @ts-ignore
          if (groups.has(groupObj.name) && groups.has(`non-${groupObj.name}`)) {
            message(
              'Warning',
              WarningType.UNNECESSARY_GROUP,
              [
                `Using "${groupObj.name}" and "non-${groupObj.name}" together is the same as using "everything".`,
              ],
              ['Replace them with ""everything".']
            );
          }

          // check if shouldn't use some other groups
          if (groupObj.unnecessaries) {
            let unnecessaryGroups: CharGroup[] = [];
            for (let i = 0; i < groupObj.unnecessaries.length; i++)
              if (
                groupObj.unnecessaries[i] !== groupObj.name &&
                groups.has(groupObj.unnecessaries[i])
              )
                unnecessaryGroups.push(groupObj.unnecessaries[i]);

            if (unnecessaryGroups.length) {
              let stringSubs: string = '';

              if (unnecessaryGroups.length === 1)
                stringSubs = `"${unnecessaryGroups[0]}"`;
              else if (unnecessaryGroups.length === 2)
                stringSubs = `"${unnecessaryGroups[0]}" and "${unnecessaryGroups[1]}"`;
              else {
                unnecessaryGroups.forEach((sub, index) => {
                  if (index > 1) stringSubs += `"${sub}", `;
                });
                stringSubs += `"${unnecessaryGroups[0]}" and "${unnecessaryGroups[1]}"`;
              }

              message(
                'Warning',
                WarningType.UNNECESSARY_GROUP,
                [
                  `Using ${stringSubs} has no effect when using "${groupObj.name}".`,
                ],
                [`Remove ${stringSubs}.`]
              );
            }
          }
        }
      } /* group name is not valid */ else {
        // suggest group name
        let GROUP_NAMES: string[] = [];
        for (let i = 0; i < GROUP_NAMES_RANGES.length; i++)
          GROUP_NAMES.push(GROUP_NAMES_RANGES[i].name);

        const suggestion = suggest(group, GROUP_NAMES);

        message(
          'Error',
          ErrorType.BAD_GROUP,
          [`Character group "${group}" is not valid.`],
          [`Did you mean "${suggestion}"?`]
        );
      }
    });

    // get groups and convert to string
    let stringGroups: string = '';
    for (let i = 0; i < GROUP_NAMES_RANGES.length; i++)
      if (groups.has(GROUP_NAMES_RANGES[i].name))
        stringGroups += GROUP_NAMES_RANGES[i].range;

    // generate results
    this.generateResults(stringGroups);

    return this;
  }
}
