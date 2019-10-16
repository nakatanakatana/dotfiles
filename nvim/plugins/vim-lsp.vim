" 
let g:lsp_log_verbose = 1
let g:lsp_log_file = expand('~/vim-lsp.log')
let g:lsp_diagnostics_echo_cursor = 1

function! s:configure_lsp() abort
  setlocal omnifunc=lsp#complete
endfunction

let g:lsp_diagnostics_enabled = 0 " for ale

nnoremap <silent> <Leader>dd :<C-u>LspDefinition<CR>
nnoremap <silent> <Leader>ds :split \| :LspDefinition <CR>
nnoremap <silent> <Leader>dv :vsplit \| :LspDefinition <CR>
nnoremap <silent> <Leader>r :<C-u>LspReferences<CR>
nnoremap <silent> <Leader>h :<C-u>LspHover<CR>
nnoremap <silent> <Leader>i :<C-u>LspImplementation<CR>

if executable('gopls')
  augroup LspGo
    au!
    autocmd User lsp_setup call lsp#register_server({
        \ 'name': 'gopls',
        \ 'cmd': {server_info->['gopls', '-mode', 'stdio']},
        \ 'whitelist': ['go'],
        \ })
    autocmd FileType go setlocal omnifunc=lsp#complete
  augroup END
endif

if executable('typescript-language-server')
    au User lsp_setup call lsp#register_server({
      \ 'name': 'typescript-language-server',
      \ 'cmd': { server_info->[&shell, &shellcmdflag, 'typescript-language-server --stdio']},
      \ 'root_uri': { server_info->lsp#utils#path_to_uri(lsp#utils#find_nearest_parent_directory(lsp#utils#get_buffer_path(), '.git/..'))},
      \ 'whitelist': ['typescript', 'javascript', 'javascript.jsx']
      \ })
endif

if executable('pyls')
    " pip install python-language-server
    au User lsp_setup call lsp#register_server({
        \ 'name': 'pyls',
        \ 'cmd': {server_info->['pyls']},
        \ 'whitelist': ['python'],
        \ })
endif

if executable('rls')
    au User lsp_setup call lsp#register_server({
        \ 'name': 'rls',
        \ 'cmd': {server_info->['rustup', 'run', 'nightly-2019-02-08', 'rls']},
        \ 'whitelist': ['rust'],
        \ })
endif
"        \ 'root_uri':{server_info->lsp#utils#path_to_uri(lsp#utils#find_nearest_parent_file_directory(lsp#utils#get_buffer_path(), 'Cargo.toml'))},

if executable('vls')
    au User lsp_setup call lsp#register_server({
        \ 'name': 'vls',
        \ 'cmd': {server_info->['vls']},
        \ 'whitelist': ['vue'],
        \ 'root_uri': { server_info->lsp#utils#path_to_uri(lsp#utils#find_nearest_parent_directory(lsp#utils#get_buffer_path(), '.git/..'))},
        \ 'initialization_options': {
        \         'config': {
        \             'html': {},
        \              'vetur': {
        \                  'validation': {}, 
        \                  'completion': {
        \                      'scaffoldSnippetSources': {}
        \                  }
        \              }
        \         }
        \     }
        \ })
endif

if executable('docker-langserver')
      au User lsp_setup call lsp#register_server({
          \ 'name': 'docker-langserver',
          \ 'cmd': {server_info->[&shell, &shellcmdflag, 'docker-langserver --stdio']},
          \ 'whitelist': ['dockerfile'],
          \ })
endif
