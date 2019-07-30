set list
set listchars=tab:»-,trail:-,nbsp:%,eol:↲
set colorcolumn=80
set number
set incsearch
set tabstop=4
set shiftwidth=4
set smartindent
set t_Co=256
set ttimeoutlen=10
set nocursorline
set splitbelow
set splitright
set autoread
set title
set noswapfile
set wildignore=git/*,*/node_modules/*,*/dist/*,*/coverage/*
augroup vimrc-checktime
  autocmd!
  autocmd WinEnter * checktime
  autocmd TermOpen * setlocal nonumber
augroup END

autocmd InsertEnter,InsertLeave * set cursorline!
autocmd QuickFixCmdPost *grep* cwindow

set signcolumn=yes
