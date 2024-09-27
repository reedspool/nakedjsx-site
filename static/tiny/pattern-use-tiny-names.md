# Use Tiny Variable Names

When scope is small and meaning is exceptionally well understood.

## Dialectic

Use when the scope is tiny. Use when the scope is massive and you reference it a lot. Use when the meaning is well understood, such as `i` for "index", or `xVel` for "velocity along the x axis". Use when long names would distract from the structure of a complex expression, such as in Math: `sqrt(a**2 + b**2)`.

Don't use when other people will need to read, check, and comprehend your code. Don't use when you have unlimited space. Don't use when you're tired of typing.

## History

In the history of JavaScript, jQuery used the dollar sign `$` as a single-character variable, and Underscore used (you guessed it) the underscore `_`.
