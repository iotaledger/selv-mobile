// svelte.config.js
const sveltePreprocess = require('svelte-preprocess');

module.exports = {
    preprocess: sveltePreprocess({
        defaults: {
            markup: 'html',
            script: 'typescript',
            style: 'css',
        },
        babel: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        loose: true,
                        // No need for babel to resolve modules
                        modules: false,
                        targets: {
                            // ! Very important. Target es6+
                            esmodules: true,
                        },
                    },
                ],
            ],
        },
    }),
    // ...other svelte options
};
