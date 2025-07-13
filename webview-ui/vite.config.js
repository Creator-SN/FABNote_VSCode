import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        outDir: path.resolve(__dirname, '../media'), // 输出到插件的 media 目录
        emptyOutDir: true,
        rollupOptions: {
            input: path.resolve(__dirname, 'index.html'),
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "./src/style/global.scss" as *;`
            }
        }
    }
})