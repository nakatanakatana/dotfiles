call denite#custom#option('_', 'prompt', '>')
call denite#custom#option('_', 'highlight_mode_insert', 'CursorLine')
call denite#custom#option('_', 'highlight_matched_char', 'None')

call denite#custom#source('file_rec', 'matchers', ['matcher_cpsm'])
call denite#custom#source('file_rec', 'sorters', ['sorter_sublime'])
call denite#custom#filter('matcher_ignore_globs', 'ignore_globs',
      \ [
      \ '.git/', 'build/', '__pycache__/',
      \ 'images/', '*.o', '*.make',
      \ 'node_modules/',
      \ '*.min.*',
     \ 'img/', 'fonts/'])
if executable('rg')
  call denite#custom#var('file_rec', 'command',
        \ ['rg', '--files', '--glob', '!.git'])
  call denite#custom#var('grep', 'command', ['rg'])
endif

nnoremap <C-p> :Denite file_rec -buffer-name=file-buffer -winheight=`50*winheight(0)/100` -auto-preview -auto-resize -vertical-preview<CR>

" Deniteの設定
nnoremap [denite] <Nop>
nmap <C-u> [denite]

" -buffer-name=
nnoremap <silent> [denite]f  :Denite grep -buffer-name=search-buffer-denite  -winheight=`50*winheight(0)/100` -auto-preview -auto-resize -vertical-preview<CR>
nnoremap <silent> [denite]r :Denite -resume -buffer-name=search-buffer-denite -auto-preview -auto-resize<CR>
" next
nnoremap <silent> [denite]n :Denite -resume -buffer-name=search-buffer-denite -select=+1 -immediately<CR>
" prev
nnoremap <silent> [denite]p :Denite -resume -buffer-name=search-buffer-denite -select=-1 -immediately<CR>
