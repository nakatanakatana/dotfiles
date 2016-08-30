scriptencoding utf-8

" いらない
set nowritebackup
set nobackup
set noswapfile

" 基本的な設定
set list
set colorcolumn=80
set number
set listchars=tab:>.,trail:-,extends:»,precedes:«,nbsp:%,eol:¬
set incsearch
set hlsearch
set tabstop=4
set shiftwidth=4
set smartindent
set cursorline
set autoread
set t_Co=254

" セミコロンをコロンと入れ替え
noremap ; :

" 画面分割・タブページの設定
" http://qiita.com/tekkoc/items/98adcadfa4bdc8b5a6ca
nnoremap s <Nop>
nnoremap sj <C-w>j
nnoremap sk <C-w>k
nnoremap sl <C-w>l
nnoremap sh <C-w>h
nnoremap sJ <C-w>J
nnoremap sK <C-w>K
nnoremap sL <C-w>L
nnoremap sH <C-w>H
nnoremap sn gt
nnoremap sp gT
nnoremap sr <C-w>r
nnoremap s= <C-w>=
nnoremap sw <C-w>w
nnoremap so <C-w>_<C-w>|
nnoremap sO <C-w>=
nnoremap sN :<C-u>bn<CR>
nnoremap sP :<C-u>bp<CR>
nnoremap st :<C-u>tabnew<CR>
nnoremap sT :<C-u>Unite tab<CR>
nnoremap ss :<C-u>sp<CR>
nnoremap sv :<C-u>vs<CR>
nnoremap sq :<C-u>q<CR>
nnoremap sQ :<C-u>bd<CR>
nnoremap sb :<C-u>Unite buffer_tab -buffer-name=file<CR>
nnoremap sB :<C-u>Unite buffer -buffer-name=file<CR>


" statuslineの設定
" ファイル名表示
set statusline=%F
" 変更チェック表示
set statusline+=%m
" 読み込み専用かどうか表示
set statusline+=%r
" ヘルプページなら[HELP]と表示
set statusline+=%h
" プレビューウインドウなら[Prevew]と表示
set statusline+=%w
" これ以降は右寄せ表示
set statusline+=%=
" file encoding
set statusline+=[ENC=%{&fileencoding}]
" 現在行数/全行数
set statusline+=[LOW=%l/%L]
" ステータスラインを常に表示(0:表示しない、1:2つ以上ウィンドウがある時だけ表示)
set laststatus=2



" 各種設定
if has('vim_starting')
	set nocompatible
endif


" C++ の設定
" FileType_cpp() 関数が定義されていれば最後にそれを呼ぶ
function! s:cpp()
	" インクルードパスを設定する
	" gf などでヘッダーファイルを開きたい場合に影響する
	let &l:path = join(filter(split($VIM_CPP_STDLIB . "," . $VIM_CPP_INCLUDE_DIR, '[,;]'), 'isdirectory(v:val)'), ',')

	" 括弧を構成する設定に <> を追加する
	" template<> を多用するのであれば
	setlocal matchpairs+=<:>

	" BOOST_PP_XXX 等のハイライトを行う
	syntax match boost_pp /BOOST_PP_[A-z0-9_]*/
	highlight link boost_pp cppStatement

	" quickrun.vim の設定
	let b:quickrun_config = {
\		"hook/add_include_option/enable" : 1
\	}

	if exists("*CppVimrcOnFileType_cpp")
		call CppVimrcOnFileType_cpp()
	endif
endfunction

" goのせってい
set rtp+=$GOROOT/misc/vim

" 括弧を入力した時にカーソルが移動しないように設定
set matchtime=0

" CursorHold の更新間隔
set updatetime=1000


let c_comment_strings=1
let c_no_curly_error=1


" プラグインのインストールディレクトリ
let s:neobundle_plugins_dir = expand(exists("$VIM_NEOBUNDLE_PLUGIN_DIR") ? $VIM_NEOBUNDLE_PLUGIN_DIR : '~/.vim/bundle')


" インクルードディレクトリ
let s:cpp_include_dirs = expand(exists("$VIM_CPP_INCLUDE_DIR") ? $VIM_CPP_INCLUDE_DIR : '')


" プラグインの読み込み
if !executable("git")
	echo "Please install git."
	finish
endif


if !isdirectory(s:neobundle_plugins_dir . "/neobundle.vim")
	echo "Please install neobundle.vim."
	function! s:install_neobundle()
		if input("Install neobundle.vim? [Y/N] : ") =="Y"
			if !isdirectory(s:neobundle_plugins_dir)
				call mkdir(s:neobundle_plugins_dir, "p")
			endif

			execute "!git clone git://github.com/Shougo/neobundle.vim "
			\ . s:neobundle_plugins_dir . "/neobundle.vim"
			echo "neobundle installed. Please restart vim."
		else
			echo "Canceled."
		endif
	endfunction
	augroup install-neobundle
		autocmd!
		autocmd VimEnter * call s:install_neobundle()
	augroup END
	finish
endif


" neobundle.vim でプラグインを読み込む
" https://github.com/Shougo/neobundle.vim
if has('vim_starting')
	execute "set runtimepath+=" . s:neobundle_plugins_dir . "/neobundle.vim"
endif

call neobundle#begin(s:neobundle_plugins_dir)

" colorscheme
NeoBundle 'w0ng/vim-hybrid'
NeoBundle 'altercation/vim-colors-solarized'

" neobundle 自身を neobundle で管理
NeoBundleFetch "Shougo/neobundle.vim"


" 各プラグインの読み込み
" プラグインの読み込みを行いたくない場合はコメントアウトして下さい


" コメントアウト
NeoBundle "tyru/caw.vim"


" 汎用的なコード補完プラグイン
" +lua な環境であれば neocomplete.vim を利用する
if has("lua")
	NeoBundle "Shougo/neocomplete.vim"
else
	NeoBundle "Shougo/neocomplcache"
endif

" unite.vim
NeoBundle "Shougo/unite.vim"

" unite-colorscheme
NeoBundle "ujihisa/unite-colorscheme"

" アウトラインの出力
NeoBundle "Shougo/unite-outline"


" C++ のシンタックス
NeoBundle "vim-jp/cpp-vim"

" wandbox
NeoBundle "rhysd/wandbox-vim"

" コード補完
NeoBundle "osyo-manga/vim-marching"

" コードの実行
NeoBundle "thinca/vim-quickrun"


" quickfix の該当箇所をハイライト
NeoBundle "jceb/vim-hier"

" quickfix の該当箇所の内容をコマンドラインに出力
NeoBundle "dannyob/quickfixstatus"

" シンタックスチェッカー
NeoBundle "osyo-manga/vim-watchdogs"
NeoBundle "osyo-manga/shabadou.vim"


" ハイライト
NeoBundle "t9md/vim-quickhl"


" python用
NeoBundle "davidhalter/jedi-vim"


" vim-filer
NeoBundle "Shougo/vimfiler.vim"


" golang
NeoBundle 'fatih/vim-go'

" vimproc.vim
" vimproc.vim を使用する場合は自前でビルドする必要があり
" kaoriya 版 vim では vimproc.vim が同梱されているので必要がないです
if !has("kaoriya")
	NeoBundle 'Shougo/vimproc.vim', {
	\ 'build' : {
	\     'windows' : 'make -f make_mingw32.mak',
	\     'cygwin' : 'make -f make_cygwin.mak',
	\     'mac' : 'make -f make_mac.mak',
	\     'unix' : 'make -f make_unix.mak',
	\    },
	\ }
endif


if exists("*CppVimrcOnNeoBundle")
	call CppVimrcOnNeoBundle()
endif

call neobundle#end()


filetype plugin indent on
syntax enable

set background=dark
colorscheme solarized 


" インストールのチェック
NeoBundleCheck

" プラグインの設定
" これはプラグインが読み込まれた場合に有効になる

" caw.vim
let s:hooks = neobundle#get_hooks("caw.vim")
function! s:hooks.on_source(bundle)
	nmap <C-_> <Plug>(caw:zeropos:toggle)
	vmap <C-_> <Plug>(caw:zeropos:toggle)
endfunction
unlet s:hooks


" neocomplet.vim
let s:hooks = neobundle#get_hooks("neocomplete.vim")
function! s:hooks.on_source(bundle)
	let g:neocomplete#enable_at_startup = 1
	" 補完に時間がかかってもスキップしない
	let g:neocomplete#skip_auto_completion_time = ""
endfunction
unlet s:hooks


" neocomplcache
let s:hooks = neobundle#get_hooks("neocomplcache")
function! s:hooks.on_source(bundle)
	let g:neocomplcache_enable_at_startup=1
endfunction
unlet s:hooks


" quickfixstatus
let s:hooks = neobundle#get_hooks("quickfixstatus")
function! s:hooks.on_post_source(bundle)
	QuickfixStatusEnable
endfunction
unlet s:hooks


" vim-quickhl
let s:hooks = neobundle#get_hooks("vim-quickhl")
function! s:hooks.on_source(bundle)
	" <Space>m でカーソル下の単語、もしくは選択した範囲のハイライトを行う
	" 再度 <Space>m を行うとカーソル下のハイライトを解除する
	" これは複数の単語のハイライトを行う事もできる
	" <Space>M で全てのハイライトを解除する
	nmap <Space>m <Plug>(quickhl-manual-this)
	xmap <Space>m <Plug>(quickhl-manual-this)
	nmap <Space>M <Plug>(quickhl-manual-reset)
	xmap <Space>M <Plug>(quickhl-manual-reset)
endfunction
unlet s:hooks


" marching.vim
let s:hooks = neobundle#get_hooks("vim-marching")
function! s:hooks.on_post_source(bundle)
	if !empty(g:marching_clang_command) && executable(g:marching_clang_command)
		" 非同期ではなくて同期処理で補完する
		let g:marching_backend = "sync_clang_command"
	else
		" clang コマンドが実行できなければ wandbox を使用する
		let g:marching_backend = "wandbox"
		let g:marching_clang_command = ""
	endif

	" オプションの設定
	" これは clang のコマンドに渡される
	let g:marching#clang_command#options = {
	\	"cpp" : "-std=gnu++1y"
	\}


	if !neobundle#is_sourced("neocomplete.vim")
		return
	endif

	" neocomplete.vim と併用して使用する場合
	" neocomplete.vim を使用すれば自動補完になる
	let g:marching_enable_neocomplete = 1

	if !exists('g:neocomplete#force_omni_input_patterns')
		let g:neocomplete#force_omni_input_patterns = {}
	endif

	let g:neocomplete#force_omni_input_patterns.cpp =
		\ '[^.[:digit:] *\t]\%(\.\|->\)\w*\|\h\w*::\w*'
	endfunction
unlet s:hooks


" quickrun.vim
let s:hooks = neobundle#get_hooks("vim-quickrun")
function! s:hooks.on_source(bundle)
	let g:quickrun_config = {
\		"_" : {
\			"runner" : "vimproc",
\			"runner/vimproc/sleep" : 10,
\			"runner/vimproc/updatetime" : 500,
\			"outputter" : "error",
\			"outputter/error/success" : "buffer",
\			"outputter/error/error"   : "quickfix",
\			"outputter/quickfix/open_cmd" : "copen",
\			"outputter/buffer/split" : ":botright 8sp",
\			"outputter/buffer/close_on_empty": 1
\		},
\
\		"cpp/wandbox" : {
\			"runner" : "wandbox",
\			"runner/wandbox/compiler" : "clang-head",
\			"runner/wandbox/options" : "warning,c++1y,boost-1.55",
\		},
\
\		"cpp/g++" : {
\			"cmdopt" : "-std=c++11 -Wall",
\		},
\
\		"cpp/clang++" : {
\			"cmdopt" : "-std=c++11 -Wall",
\		},
\
\		"cpp/watchdogs_checker" : {
\			"type" : "watchdogs_checker/clang++",
\		},
\	
\		"watchdogs_checker/_" : {
\			"outputter/quickfix/open_cmd" : "",
\		},
\	
\		"watchdogs_checker/g++" : {
\			"cmdopt" : "-Wall",
\		},
\	
\		"watchdogs_checker/clang++" : {
\			"cmdopt" : "-Wall",
\		},
\	}

	let s:hook = {
	\	"name" : "add_include_option",
	\	"kind" : "hook",
	\	"config" : {
	\		"option_format" : "-I%s"
	\	},
	\}

	function! s:hook.on_normalized(session, context)
		" filetype==cpp 以外は設定しない
		if &filetype !=# "cpp"
			return
		endif
		let paths = filter(split(&path, ","), "len(v:val) && v:val !='.' && v:val !~ $VIM_CPP_STDLIB")
		
		if len(paths)
			let a:session.config.cmdopt .= " " . join(map(paths, "printf(self.config.option_format, v:val)")) . " "
		endif
	endfunction

	call quickrun#module#register(s:hook, 1)
	unlet s:hook


	let s:hook = {
	\	"name" : "clear_quickfix",
	\	"kind" : "hook",
	\}

	function! s:hook.on_normalized(session, context)
		call setqflist([])
	endfunction

	call quickrun#module#register(s:hook, 1)
	unlet s:hook

endfunction
unlet s:hooks


" vim-watchdogs
let s:hooks = neobundle#get_hooks("vim-watchdogs")
function! s:hooks.on_source(bundle)
	let g:watchdogs_check_BufWritePost_enable = 1
endfunction
unlet s:hooks



if exists("*CppVimrcOnPrePlugin")
	call CppVimrcOnPrePlugin()
endif


call neobundle#call_hook('on_source')


if exists("*CppVimrcOnFinish")
	call CppVimrcOnFinish()
endif



augroup vimrc-cpp
	autocmd!
	" filetype=cpp が設定された場合に関数を呼ぶ
	autocmd FileType cpp call s:cpp()
augroup END


" jedi-vim
autocmd FileType python setlocal omnifunc=jedi#completions
let g:jedi#completions_enabled = 0
let g:jedi#auto_vim_configuration = 0

if !exists('g:neocomplete#force_omni_input_patterns')
	let g:neocomplete#force_omni_input_patterns = {}
endif

let g:neocomplete#force_omni_input_patterns.python = '\h\w*\|[^.\t]\.\w*'

autocmd FileType python setlocal completeopt-=preview:

