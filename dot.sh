#! /bin/sh

ln -s -i $PWD/enhancd $HOME/.enhancd
ln -s -i $PWD/_bashrc $HOME/.bashrc
ln -s -i $PWD/_gitconfig $HOME/.gitconfig
ln -s -i $PWD/_profile $HOME/.profile
ln -s -i $PWD/_screenrc $HOME/.screenrc
ln -s -i $PWD/_screenrc.ssh_keybind $HOME/.screenrc.ssh_keybind
ln -s -i $PWD/nvim/init.vim $HOME/.vimrc
ln -s -i $PWD/nvim $HOME/.config/nvim
ln -s -i $PWD/git-tmp $HOME/.git-tmp

git config --global init.templatedir '~/.git-tmp'
