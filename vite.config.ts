import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    build: {
    rollupOptions: {
      input: {
        // ここにビルドしたいHTMLファイルを追加します
        // キー（'main'や'votesystem'）は出力ファイル名に使われます
        main: 'index.html',
        votesystem: 'VoteSystem.html',
      }
    }
  },
})
