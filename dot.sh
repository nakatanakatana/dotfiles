#! /bin/sh
ln -s -i $PWD/.profile $HOME/
ln -s -i $PWD/.bashrc $HOME/
ln -s -i $PWD/alacritty.yml $HOME/.alacritty.yml
ln -s -i $PWD/_gitconfig $HOME/.gitconfig
ln -s -i $PWD/.tmux.conf $HOME/
ln -s -i $PWD/nvim/init.vim $HOME/.vimrc
ln -s -i $PWD/nvim $HOME/.config/nvim
ln -s -i $PWD/git-tmp $HOME/.git-tmp

git config --global init.templatedir '~/.git-tmp'
