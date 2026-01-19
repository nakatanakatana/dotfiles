set encoding=utf-8
set list
set listchars=tab:»-,trail:-,nbsp:%,eol:↲
set colorcolumn=80
set number
set incsearch
set hlsearch
set tabstop=4
set shiftwidth=4
set smartindent
set t_Co=256
set ttimeoutlen=10
set nocursorline
set fileencodings=utf-8,cp932
set noequalalways
set splitbelow
set splitright
set autoread
set title
set noswapfile
set ambiwidth=single
set wildignore=git/*,*/node_modules/*,*/dist/*,*/coverage/*
set viminfo+=n~/.cache/viminfo

set signcolumn=yes

au BufRead,BufNewFile *.cue set filetype=cue

function! IsWSL()
  if has("unix")
    let lines = readfile("/proc/version")
    if lines[0] =~ "microsoft"
      return 1
    endif
  endif
  return 0
endfunction

augroup vimrc-checktime
  autocmd!
  autocmd WinEnter * checktime
augroup END
if exists('+termguicolors')
  let &t_8f = "\<Esc>[38;2;%lu;%lu;%lum"
  let &t_8b = "\<Esc>[48;2;%lu;%lu;%lum"
  set termguicolors
endif

if empty($VIM_TERMINAL)
  autocmd VimEnter * call dein#update()
endif

autocmd TerminalOpen *
\ autocmd WinLeave <buffer>
\   if term_getstatus('') =~# '\<normal\>' |
\     execute 'normal! GA'                 |
\   endif

autocmd ModeChanged t:nt set nonumber nolist signcolumn=no

autocmd InsertEnter,InsertLeave * set cursorline!
autocmd QuickFixCmdPost *grep* cwindow

" neovim-remote
if has('nvim')
  let $GIT_EDITOR = 'nvr -cc split --remote-wait'
endif
autocmd FileType gitcommit,gitrebase,gitconfig set bufhidden=delete

" for tmux
autocmd BufReadPost,FileReadPost,BufNewFile * call system("tmux rename-window 'vim: " . substitute(expand("%:p:h"), expand("~/"), "", "g") . "'")
autocmd VimLeave * call system("tmux setw automatic-rename")
