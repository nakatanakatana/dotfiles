" release autogroup in MyAutoCmd
augroup MyAutoCmd
  autocmd!
augroup END

" search
set ignorecase
set smartcase
set incsearch
set hlsearch

" �Хå�����å���䥯��������������˹�碌��ưŪ�˥���������
cnoremap <expr> / getcmdtype() == '/' ? '\/' : '/'
cnoremap <expr> ? getcmdtype() == '?' ? '\?' : '?'


" modify
set shiftround          " '<'��'>'�ǥ���ǥ�Ȥ���ݤ�'shiftwidth'���ܿ��˴ݤ��
set infercase           " �䴰������ʸ����ʸ������̤��ʤ�
set virtualedit=all     " ���������ʸ����¸�ߤ��ʤ���ʬ�Ǥ�ư����褦�ˤ���
set hidden              " �Хåե����Ĥ�������˱�����Undo�����Ĥ������
set switchbuf=useopen   " ��������������ˤ��Ǥ˳����Ƥ���Хåե��򳫤�
set showmatch           " �б������̤ʤɤ�ϥ��饤��ɽ������
set matchtime=3         " �б���̤Υϥ��饤��ɽ����3�äˤ���

" �б���̤�'<'��'>'�Υڥ����ɲ�
set matchpairs& matchpairs+=<:>

" �Хå����ڡ����Ǥʤ�Ǥ�ä���褦�ˤ���
set backspace=indent,eol,start

" ����åץܡ��ɤ�ǥե���ȤΥ쥸�����Ȥ��ƻ��ꡣ���YankRing��Ȥ��Τ�
" 'unnamedplus'��¸�ߤ��Ƥ��뤫�ɤ����������ʬ����ɬ�פ�����
if has('unnamedplus')
    " set clipboard& clipboard+=unnamedplus " 2013-07-03 14:30 unnamed �ɲ�
    set clipboard& clipboard+=unnamedplus,unnamed 
else
    " set clipboard& clipboard+=unnamed,autoselect 2013-06-24 10:00 autoselect ���
    set clipboard& clipboard+=unnamed
endif

" Swap�ե����롩Backup�ե����롩������Ū����
" �ʤΤ�����̵��������
set nowritebackup
set nobackup
set noswapfile


" view
set list                " �ԲĻ�ʸ���βĻ벽
set number              " ���ֹ��ɽ��
set wrap                " Ĺ���ƥ����Ȥ��ޤ��֤�
set textwidth=0         " ��ưŪ�˲��Ԥ�����Τ�̵����
set colorcolumn=80      " ��������80ʸ���ܤ˥饤��������

" ������Ū�����꡼��٥��̵����
set t_vb=
set novisualbell


" macro
" ���ϥ⡼��������᤯jj�����Ϥ�������ESC�Ȥߤʤ�
inoremap jj <Esc>

" ESC����󲡤����Ȥǥϥ��饤�Ȥ�ä�
nmap <silent> <Esc><Esc> :nohlsearch<CR>

" �������벼��ñ��� * �Ǹ���
vnoremap <silent> * "vy/\V<C-r>=substitute(escape(@v, '\/'), "\n", '\\n', 'g')<CR><CR>

" ������˥����פ����ݤ˸���ñ����������˻��äƤ���
nnoremap n nzz
nnoremap N Nzz
nnoremap * *zz
nnoremap # #zz
nnoremap g* g*zz
nnoremap g# g#zz

" j, k �ˤ���ư���ޤ��֤��줿�ƥ����ȤǤ⼫���˿����񤦤褦���ѹ�
nnoremap j gj
nnoremap k gk

" v�����ǹ����ޤ�����
vnoremap v $h

" TAB�ˤ��б��ڥ��˥�����
nnoremap <Tab> %
vnoremap <Tab> %

" Ctrl + hjkl �ǥ�����ɥ��֤��ư
nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l

" Shift + ����ǥ�����ɥ����������ѹ�
nnoremap <S-Left>  <C-w><<CR>
nnoremap <S-Right> <C-w>><CR>
nnoremap <S-Up>    <C-w>-<CR>
nnoremap <S-Down>  <C-w>+<CR>

" T + ? �ǳƼ������ȥ���
nnoremap [toggle] <Nop>
nmap T [toggle]
nnoremap <silent> [toggle]s :setl spell!<CR>:setl spell?<CR>
nnoremap <silent> [toggle]l :setl list!<CR>:setl list?<CR>
nnoremap <silent> [toggle]t :setl expandtab!<CR>:setl expandtab?<CR>
nnoremap <silent> [toggle]w :setl wrap!<CR>:setl wrap?<CR>

" make, grep �ʤɤΥ��ޥ�ɸ�˼�ưŪ��QuickFix�򳫤�
autocmd MyAutoCmd QuickfixCmdPost make,grep,grepadd,vimgrep copen

" QuickFix�����Help�Ǥ� q �ǥХåե����Ĥ���
autocmd MyAutoCmd FileType help,qf nnoremap <buffer> q <C-w>c

" w!! �ǥ����ѡ��桼�����Ȥ�����¸��sudo���Ȥ���Ķ������
cmap w!! w !sudo tee > /dev/null %

" :e �ʤɤǥե�����򳫤��ݤ˥ե������¸�ߤ��ʤ����ϼ�ư����
function! s:mkdir(dir, force)
  if !isdirectory(a:dir) && (a:force ||
        \ input(printf('"%s" does not exist. Create? [y/N]', a:dir)) =~? '^y\%[es]$')
    call mkdir(iconv(a:dir, &encoding, &termencoding), 'p')
  endif
endfunction
autocmd MyAutoCmd BufWritePre * call s:mkdir(expand('<afile>:p:h'), v:cmdbang)


