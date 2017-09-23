const tape = require('tape')
const BaseJoi = require('joi')
const Extension = require('../')
const Joi = BaseJoi.extend(Extension)

const correct_sample = [{
    idx: 1
}, {
    idx: 2
}, {
    idx: 3
}]

const incorrect_sample = [{
    idx: 1
}, {
    idx: 4
}, {
    idx: 3
}]

tape.test('should be correctly described', (t) => {
    const schema = Joi.array().items({
        idx: Joi.number().integer()
    }).continuous('idx', 2);

    t.deepEqual(schema.describe(), {
        type: 'array',
        flags: {
            sparse: false,
            comparator: 'idx',
            startIndex: 2
        },
        options: {
            language: {
                array: {
                    continuous_from: 'must be start from {{startIndex}}',
                    continuous_broken: 'should be {{expectedValue}}'
                }
            }
        },
        rules: [
            {
                name: 'continuous',
                arg: {
                    comparator: 'idx',
                    startIndex: 2
                },
                description: 'idx must be an integer and started continuous from 2'
            }
        ],
        items: [
            {
                type: 'object',
                children: {
                    idx: {
                        type: 'number',
                        invalids: [Infinity, -Infinity],
                        rules: [{
                            name: 'integer'
                        }]
                    }
                }
            }
        ]
    })
    t.end()
})

tape.test('fails with invalid comparator', (t) => {
    const schema = Joi.array().items({
        idx: Joi.number().integer()
    }).continuous({})

    t.throws(() => schema.validate(correct_sample), Error, 'comparator must be a function or a string')
    t.end()
})

tape.test('fails without startIndex', (t) => {
    const schema = Joi.array().items({
        idx: Joi.number().integer()
    }).continuous('idx')

    schema.validate(correct_sample, (err, val) => {
        t.deepEqual(err.details, [
            {
                message: '"value" must be start from 0',
                path: ['idx'],
                type: 'array.continuous_from',
                context: {
                    comparator: 'idx',
                    records: [1, 2, 3],
                    startIndex: 0,
                    key: 'idx',
                    label: 'value'
                }
            }
        ])

        t.end()
    })
})

tape.test('fails with incorrect startIndex', (t) => {
    const schema = Joi.array().items({
        idx: Joi.number().integer()
    }).continuous('idx', 2)

    schema.validate(incorrect_sample, (err, val) => {
        t.deepEqual(err.details, [
            {
                message: '"value" must be start from 2',
                path: ['idx'],
                type: 'array.continuous_from',
                context: {
                    comparator: 'idx',
                    records: [1, 3, 4],
                    startIndex: 2,
                    key: 'idx',
                    label: 'value'
                }
            }
        ])

        t.end()
    })
})

tape.test('fails with correct startIndex but noncontinuous', (t) => {
    const schema = Joi.array().items({
        idx: Joi.number().integer()
    }).continuous('idx', 1)

    schema.validate(incorrect_sample, (err, val) => {
        t.deepEqual(err.details, [
            {
                message: '"value" should be 2',
                path: ['idx'],
                type: 'array.continuous_broken',
                context: {
                    comparator: 'idx',
                    value: {
                        'idx': 3
                    },
                    expectedValue: 2,
                    key: 'idx',
                    label: 'value'
                }
            }
        ])

        t.end()
    })
})

tape.test('correct startIndex and continuous', (t) => {
    const schema = Joi.array().items({
        idx: Joi.number().integer()
    }).continuous('idx', 1)

    schema.validate(correct_sample, (err, val) => {
        t.deepEqual(err, null)
        t.end()
    })
})