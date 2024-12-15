import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Check Numeric Flow Variable',
  description:
    `
    Check Numeric Flow Variable \n
    \n
    Compared to the standard Check Flow Variable plugin this supports helpful numeric operations like less-than and 
    greater-than rather than just equal-to and not-equal-to. This is helpful for managing loops.
    `,
  style: {
    borderColor: 'orange',
  },
  tags: '',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faQuestion',
  inputs: [
    {
      label: 'Variable',
      name: 'variable',
      type: 'string',
      defaultValue: '',
      inputUI: {
        type: 'text',
      },
      tooltip:
        `
        Variable to check using templating
        \n\n
        https://docs.tdarr.io/docs/plugins/flow-plugins/basics#plugin-variable-templating
        \n\n
        Example
        \n\n
        {{{args.variables.user.transcode_attempts}}}
        `,
    },
    {
      label: 'Condition',
      name: 'condition',
      type: 'string',
      defaultValue: '==',
      inputUI: {
        type: 'dropdown',
        options: [
          '==',
          '!=',
          '<',
          '<=',
          '>',
          '>=',
        ],
      },
      tooltip: 'Check condition',
    },
    {
      label: 'Value',
      name: 'value',
      type: 'number',
      defaultValue: '',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Value of variable to compare to',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'The variable matches the condition',
    },
    {
      number: 2,
      tooltip: 'The variable does not match the condition',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (args: IpluginInputArgs): IpluginOutputArgs => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);
  // retrieve configuration
  const currentValue: number = args.inputs.variable ? Number(args.inputs.variable) : 0;
  const condition: string = String(args.inputs.condition);
  const expectedValue: number = Number(args.inputs.value);
  // evaluate condition
  args.jobLog(`checking if [${currentValue}] [${condition}] [${expectedValue}]`);
  let outputNumber: number;
  switch (condition) {
    case '==':
      outputNumber = (currentValue === expectedValue) ? 1 : 2;
      break;
    case '!=':
      outputNumber = (currentValue !== expectedValue) ? 1 : 2;
      break;
    case '<':
      outputNumber = (currentValue < expectedValue) ? 1 : 2;
      break;
    case '<=':
      outputNumber = (currentValue <= expectedValue) ? 1 : 2;
      break;
    case '>':
      outputNumber = (currentValue > expectedValue) ? 1 : 2;
      break;
    case '>=':
      outputNumber = (currentValue >= expectedValue) ? 1 : 2;
      break;
    default:
      // assume false if condition is not supported (not sure how this happens using dropdown input)
      outputNumber = 2;
  }

  return {
    outputFileObj: args.inputFileObj,
    outputNumber,
    variables: args.variables,
  };
};

export {
  details,
  plugin,
};
