let mapleader = "\<Space>"
nnoremap ; :

if has('nvim')
  tnoremap <silent> <ESC> <C-\><C-n>
endif

" move
nnoremap <Leader>h ^
nnoremap <Leader>l &

" tag jump
nnoremap <C-h> :vsp<CR> :exe("tjump ".expand('<cword>'))<CR>
nnoremap <C-k> :split<CR> :exe("tjump ".expand('<cword>'))<CR>

"change display mapping
nnoremap <C-Down> <C-w>j
nnoremap <C-Up> <C-w>k
nnoremap <C-Left> <C-w>h
nnoremap <C-Right> <C-w>l

"hide hlsearch
nnoremap <silent><Esc><Esc> :<C-u>nohlsearch<CR>

" util
nnoremap <Leader>r :%s/
nnoremap <Leader>f /
