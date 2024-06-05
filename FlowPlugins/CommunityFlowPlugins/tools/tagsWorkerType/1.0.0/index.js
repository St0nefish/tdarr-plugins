"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Tags: Worker Type',
    description: "\nRequeues the item into the staging section if the current worker\ndoes not match the required worker type and tags.\n\nYou can set the 'Node Tags' in the Node options panel.\n\nThe current tags must be a subset of the required tags.\n  ",
    style: {
        borderColor: 'yellow',
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.20.01',
    sidebarPosition: -1,
    icon: 'faFilter',
    inputs: [
        {
            label: 'Required Transcode Worker Type',
            name: 'requiredWorkerType',
            type: 'string',
            defaultValue: 'CPUorGPU',
            inputUI: {
                type: 'dropdown',
                options: [
                    'CPUorGPU',
                    'CPU',
                    'GPU',
                    'GPU:nvenc',
                    'GPU:qsv',
                    'GPU:vaapi',
                    'GPU:videotoolbox',
                    'GPU:amf',
                ],
            },
            tooltip: 'Specify worker type',
        },
        {
            label: 'Required Node Tags',
            name: 'requiredNodeTags',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'textarea',
                style: {
                    height: '100px',
                },
            },
            tooltip: "\ntag1,tag2\n      ",
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) {
    var lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    var requiredWorkerType = String(args.inputs.requiredWorkerType);
    var requiredNodeTags = String(args.inputs.requiredNodeTags);
    var requiredTags = [];
    var currentTags = [];
    requiredTags.push("require".concat(requiredWorkerType));
    if (requiredNodeTags) {
        requiredTags = requiredTags.concat(requiredNodeTags.split(',').map(function (tag) { return tag.trim(); }));
    }
    var currentWorkerType = args.workerType;
    if (requiredWorkerType === 'CPUorGPU') {
        currentTags.push('requireCPUorGPU');
    }
    else if (currentWorkerType === 'transcodecpu') {
        currentTags.push('requireCPU');
    }
    else if (currentWorkerType === 'transcodegpu') {
        if (args.nodeHardwareType && args.nodeHardwareType !== '-') {
            currentTags.push("requireGPU:".concat(args.nodeHardwareType));
        }
        else {
            currentTags.push('requireGPU');
        }
    }
    if (args.nodeTags) {
        currentTags = currentTags.concat(args.nodeTags.split(',').map(function (tag) { return tag.trim(); }));
    }
    args.jobLog("Required Tags: ".concat(requiredTags.join(',')));
    args.jobLog("Current Tags: ".concat(currentTags.join(',')));
    var isSubset = true;
    for (var i = 0; i < currentTags.length; i += 1) {
        if (!requiredTags.includes(currentTags[i])) {
            isSubset = false;
            break;
        }
    }
    if (isSubset) {
        // eslint-disable-next-line no-param-reassign
        args.variables.queueTags = '';
        args.jobLog('Worker type and tags are subset of required tags');
    }
    else {
        // eslint-disable-next-line no-param-reassign
        args.variables.queueTags = requiredTags.join(',');
        args.jobLog('Worker type and tags are not subset of required tags,'
            + " requeueing with tags ".concat(args.variables.queueTags));
    }
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;