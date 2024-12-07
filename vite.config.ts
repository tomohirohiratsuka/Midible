import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import * as path from "node:path";

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'Midible',
            fileName: (format) => `midible.${format}.js`,
            formats: ['es', 'umd'],
        },
        rollupOptions: {
            external: [],
            output: {
                globals: {},
            },
        },
    },
    plugins: [
        dts({
            outDir: 'dist',
            insertTypesEntry: true,
            rollupTypes: true,
            include: ['src/**/*.ts'],
        }),
        cssInjectedByJsPlugin()
    ],
    server: {
        open: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        }
    }
});
