#! /usr/bin/bash

sudo apt update
sudo apt install -y curl screen git ibus-mozc python-pip python3-pip exfat-fuse exfat-utils unrar

# mozc
# https://qiita.com/nabenabe0928/items/09affae67df9c150ad50

# alacritty
# https://github.com/jwilm/alacritty/releases

# station
# https://getstation.com/

# nvim
# https://github.com/neovim/neovim/wiki/Installing-Neovim

# chrome
# https://www.google.com/intl/ja_jp/chrome/

# golang
# https://golang.org/doc/install?download=go1.13.1.linux-amd64.tar.gz

# python
sudo pip install virtualenvwrapper

# nvm
# https://github.com/nvm-sh/nvm#installation-and-update
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

# java
# https://www.java.com/ja/download/linux_manual.jsp

# rust
curl https://sh.rustup.rs -sSf | sh

# language-server
go get golang.org/x/tools/gopls
npm install -g typescript-language-server vue-language-server dockerfile-language-server-nodejs
pip install python-language-server
rustup component add rls rust-analysis rust-src
