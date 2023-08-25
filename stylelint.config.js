module.exports = {
    extends: ['stylelint-config-standard-scss'],
    rules: {
        'at-rule-no-unknown': [
            true,
            {
                ignoreAtRules: ['tailwind']
            }
        ],
        'declaration-block-trailing-semicolon': null,
        'color-function-notation': 'legacy',
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['deep']
            }
        ]
    }
}
