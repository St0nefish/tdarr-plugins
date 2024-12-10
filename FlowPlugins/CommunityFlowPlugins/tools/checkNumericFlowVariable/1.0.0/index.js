"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Check Numeric Flow Variable',
    description: "\n    Check Numeric Flow Variable \n\n    \n\n    Compared to the standard Check Flow Variable plugin this supports helpful numeric operations like less-than and \n    greater-than rather than just equal-to and not-equal-to. This is helpful for managing loops.\n    ",
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
            tooltip: "\n        Variable to check using templating\n        \n\n\n        https://docs.tdarr.io/docs/plugins/flow-plugins/basics#plugin-variable-templating\n        \n\n\n        Example\n        \n\n\n        {{{args.variables.user.transcode_attempts}}}\n        ",
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
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) {
    var lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    // retrieve configuration
    var currentValue = args.inputs.variable ? Number(args.inputs.variable) : 0;
    var condition = String(args.inputs.condition);
    var expectedValue = Number(args.inputs.value);
    // evaluate condition
    args.jobLog("checking if [".concat(currentValue, "] [").concat(condition, "] [").concat(expectedValue, "]"));
    var outputNumber;
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
    // standard return
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: outputNumber,
        variables: args.variables,
    };
};
exports.plugin = plugin;
