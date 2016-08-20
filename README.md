# why espower-ts-node

power-assert is a really great project which makes writing expressive test much easier. It supports a lot of different javascript flavours and tools, which is great.

ts-node is also a really great project that handles a lot of the basics that a project like power-assert shouldn't need to worry about. it's awkward for ts-node users to need to work out how to configure how another loader will handle typescript compilation when they've already settled on ts-node.

Much better that ts-node users can simply keep using ts-node as they already have, with the awesome extra testing power that power-assert gives them.

##usage

### calling mocha directly with ts-node as a compiler - test files distinguished by extension

`mocha --compilers ts:ts-node/register,tsx:ts-node/register  --require espower-ts-node src/**/*.test.ts`

### calling mocha directly with ts-node as a compiler - test files distinguished by directory

`mocha --compilers ts:ts-node/register,tsx:ts-node/register  --require espower-ts-node test/**/*.ts`

### passing flags to ts-node - test files distinguished by extension

`ts-node -D -F ./node_modules/mocha/bin/_mocha --require espower-ts-node src/**/*.test.ts`

### passing flags to ts-node - test files distinguished by directory

`ts-node -D -F ./node_modules/mocha/bin/_mocha --require espower-ts-node test/**/*.ts`

## I'm compiling with great.io (the latest fab js flavour) - will this work?

Probably! It just depends on how great.io handles source maps - so long as it's consistent with how ts-node handles source maps then it Should Work Fine (tm).
