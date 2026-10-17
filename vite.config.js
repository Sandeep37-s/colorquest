import {defineConfig} from 'vite';
export default defineConfig(({mode})=>({
  base:'./',
  build:{outDir:mode==='youtube'?'dist-youtube':'dist',target:'es2020'},
  plugins:[{name:'youtube-entry',transformIndexHtml:{order:'pre',handler(html){
    return mode==='youtube'?html.replace('<!-- platform-sdk -->','<script src="https://www.youtube.com/game_api/v1"></script>'):html;
  }}}],
}));
