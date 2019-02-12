let g:lsp_log_verbose = 1
let g:lsp_log_file = expand('~/vim-lsp.log')
let g:lsp_diagnostics_echo_cursor = 1

let g:lsp_diagnostics_enabled = 0 " for ale

function! s:configure_lsp() abort
  setlocal omnifunc=lsp#complete
  nnoremap <buffer> <leader>d :<C-u>LspDefinition<CR>
  nnoremap <buffer> <leader>D :<C-u>LspReferences<CR>
  nnoremap <buffer> <leader>s :<C-u>LspDocumentSymbol<CR>
  nnoremap <buffer> <leader>S :<C-u>LspWorkspaceSymbol<CR>
  nnoremap <buffer> <leader>Q :<C-u>LspDocumentFormat<CR>
  vnoremap <buffer> <leader>Q :LspDocumentRangeFormat<CR>
  nnoremap <buffer> <leader>K :<C-u>LspHover<CR>
  nnoremap <buffer> <F1> :<C-u>LspImplementation<CR>
  nnoremap <buffer> <F6> :<C-u>LspRename<CR>
endfunction

if executable('golsp')
  augroup LspGo
    au!
    autocmd User lsp_setup call lsp#register_server({
        \ 'name': 'go-lang',
        \ 'cmd': {server_info->['golsp', '-mode', 'stdio']},
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
        \ 'root_uri':{server_info->lsp#utils#path_to_uri(lsp#utils#find_nearest_parent_file_directory(lsp#utils#get_buffer_path(), 'Cargo.toml'))},
        \ 'whitelist': ['rust'],
        \ })
endif
