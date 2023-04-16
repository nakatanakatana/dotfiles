#! /bin/sh
if [ ! -e $HOME/.config ]; then mkdir $HOME/.config; fi

# ln -s -i $PWD/.profile $HOME/
ln -s -i $PWD/.bashrc $HOME/
ln -s -i $PWD/_gitconfig $HOME/.gitconfig
ln -s -i $PWD/.tmux.conf $HOME/
ln -s -i $PWD/.gitmux.conf $HOME/.gitmux.conf
ln -s -i $PWD/nvim/init.vim $HOME/.vimrc
ln -s -i $PWD/nvim $HOME/.config/nvim
ln -s -i $PWD/aqua.yaml $HOME/
