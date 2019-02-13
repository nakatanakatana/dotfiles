nnoremap ; :

if has('nvim')
  tnoremap <silent> <ESC> <C-\><C-n>
endif

" move
nnoremap <Leader>h ^
nnoremap <Leader>l $

" save,quit
nnoremap <Leader>w :w<CR>
nnoremap <Leader><Leader>q :q<CR>

" yank
vnoremap <Leader><Leader>y "+y
vnoremap <Leader><Leader>d "+d

"change display mapping
nnoremap <C-Down> <C-w>j
nnoremap <C-Up> <C-w>k
nnoremap <C-Left> <C-w>h
nnoremap <C-Right> <C-w>l

" split
nnoremap <Leader><Leader>s :<C-u>split<CR>
nnoremap <Leader><Leader>v :<C-u>vsplit<CR>

" tab
nnoremap <Leader><Leader><Leader> :<C-u>tabnew<CR>
nnoremap <Leader><Leader>n :<C-u>tabnext<CR>
nnoremap <Leader><Leader>p :<C-u>tabprevious<CR>

"hide hlsearch
nnoremap <silent><Esc><Esc> :<C-u>nohlsearch<CR>

" util
nnoremap <Leader>r :%s/
nnoremap <Leader>f /

