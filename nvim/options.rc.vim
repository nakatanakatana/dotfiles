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
set fileencodings=utf-8,cp932
set splitbelow
set splitright
set autoread
set title
set noswapfile
set wildignore=git/*,*/node_modules/*,*/dist/*,*/coverage/*
if has('nvim')
  augroup vimrc-checktime
    autocmd!
    autocmd WinEnter * checktime
    autocmd TermOpen * setlocal nonumber
  augroup END
endif
if exists('+termguicolors')
  let &t_8f="\<Esc>[38;2;%lu;%lu;%lum"
  let &t_8b="\<Esc>[48;2;%lu;%lu;%lum"
  set termguicolors
endif

autocmd InsertEnter,InsertLeave * set cursorline!
autocmd QuickFixCmdPost *grep* cwindow

set signcolumn=yes
" neovim-remote
if has('nvim')
  let $GIT_EDITOR = 'nvr -cc split --remote-wait'
endif
autocmd FileType gitcommit,gitrebase,gitconfig set bufhidden=delete
" for tmux
autocmd BufReadPost,FileReadPost,BufNewFile * call system("tmux rename-window 'vim: " . substitute(expand("%:p:h"), expand("~/"), "", "g") . "'")
autocmd VimLeave * call system("tmux setw automatic-rename")
