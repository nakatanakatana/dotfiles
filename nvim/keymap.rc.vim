nnoremap ; :

if has('nvim')
  tnoremap <silent> <ESC> <C-\><C-n>
endif

"change display mapping
nmap <C-Down> <C-w>j
nmap <C-Up> <C-w>k
nmap <C-Left> <C-w>h
nmap <C-Right> <C-w>l
"hide hlsearch
nnoremap <silent><Esc><Esc> :<C-u>nohlsearch<CR>

