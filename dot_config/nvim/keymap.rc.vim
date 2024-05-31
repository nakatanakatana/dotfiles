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
if has('nvim')
  nnoremap <Leader>wt :<C-u>terminal<CR>
elseif !has('nvim')
  autocmd TerminalOpen * setlocal winfixheight
  nnoremap <Leader>wt :<C-u>bo terminal ++close ++rows=20<CR>
  tnoremap <C-W><C-n> <C-W>N
endif

"hide hlsearch
nnoremap <silent><Esc><Esc> :<C-u>nohlsearch<CR>
