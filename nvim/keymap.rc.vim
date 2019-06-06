nnoremap ; :

if has('nvim')
  tnoremap <silent> <ESC> <C-\><C-n>
endif

" move
nnoremap <C-h> ^
nnoremap <C-l> $

" save,quit
nnoremap <Leader>w :w<CR>

" yank
vnoremap <Leader><Leader>y "+y
vnoremap <Leader><Leader>d "+d

"change display mapping
nnoremap <C-Down> <C-w>j
nnoremap <C-Up> <C-w>k
nnoremap <C-Left> <C-w>h
nnoremap <C-Right> <C-w>l

" split
nnoremap <Leader>ws :<C-u>split<CR>
nnoremap <Leader>wv :<C-u>vsplit<CR>

" tab
nnoremap <Leader><Leader><Leader> :<C-u>tabnew<CR>
nnoremap <Leader>n :<C-u>tabnext<CR>
nnoremap <Leader>p :<C-u>tabprevious<CR>

"hide hlsearch
nnoremap <silent><Esc><Esc> :<C-u>nohlsearch<CR>

" search/replace
nnoremap <Leader>8 :vimgrep /<C-R><C-W>/ **/*.*<CR>
