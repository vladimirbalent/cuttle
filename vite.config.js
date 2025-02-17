import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import istanbul from "vite-plugin-istanbul";

// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // See https://vitejs.dev/config/#using-environment-variables-in-config
  const env = loadEnv(mode, process.cwd(), '');
  let HOST_SERVER_URL = 'http://localhost:1337';
  if (env.CUTTLE_DOCKERIZED === 'true') {
    // This needs to be the hostname of the docker container, not localhost since it happens
    // on the server side as a proxy from vite server to the sailsjs container
    HOST_SERVER_URL = 'http://server:1337';
    console.log(`Running Cuttle in DOCKER, setting server url to "${HOST_SERVER_URL}"`);
  }

  return {
    plugins: [
      vue(),
      vuetify({
        autoImport: false,
        styles: { configFile: 'src/sass/variables.scss' },
      }),
      istanbul({
        include: ['src/*', 'api/*'],
        exclude: ['node_modules', 'test/', '.github', '.husky', '.nyc_output', '.storybook', '.tmp', '.vscode', 'config', 'coverage', 'cypress', 'docker', 'docs', 'public', 'tests', 'tools'],
        extension: [ '.js', '.ts', '.vue' ],
        cypress: true,
        requireEnv: false,
      }),
    ],
    resolve: {
      alias: {
        _: resolve(__dirname),
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 8080,
      strictPort: true,
      cors: false,
      proxy: {
        '/game': {
          target: HOST_SERVER_URL,
          changeOrigin: true,
        },
        // Required for the health response to work on the client
        '/health': {
          target: HOST_SERVER_URL,
          changeOrigin: true,
        },
        '/user': {
          target: HOST_SERVER_URL,
          changeOrigin: true,
        },
        '/test': {
          target: HOST_SERVER_URL,
          changeOrigin: true,
        },
      },
      // Watching doesn't work on windows, so we need to use polling -- this does lead to high CPU
      // usage though, which is a bit of a bummer. Should probably make this conditional at some
      // point, see https://v3.vitejs.dev/config/server-options.html#server-watch
      watch: {
        usePolling: true,
      },
    },
    test: {
      include: ['**/tests/unit/**/*.{j,t}s?(x)'],
    },
    build: {
      outDir: 'assets',
    },
  };
});
