# ~/.bashrc: executed by bash(1) for non-login shells.
# see /usr/share/doc/bash/examples/startup-files (in the package bash-doc)
# for examples

# If not running interactively, don't do enything
case $- in
    *i*) ;;
      *) return;;
esac

# don't put duplicate lines or lines starting with space in the history.
# See bash(1) for more options
HISTCONTROL=ignoreboth

# append to the history file, don't overwrite it
shopt -s histappend

# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=1000
HISTFILESIZE=2000

# check the window size after each command and, if necessary,
# update the values of LINES and COLUMNS.
shopt -s checkwinsize

# If set, the pattern "**" used in a pathname expansion context will
# match all files and zero or more directories and subdirectories.
#shopt -s globstar

# make less more friendly for non-text input files, see lesspipe(1)
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# set variable identifying the chroot you work in (used in the prompt below)
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi

# set a fancy prompt (non-color, unless we know we "want" color)
case "$TERM" in
    xterm-color) color_prompt=yes;;
esac

# uncomment for a colored prompt, if the terminal has the capability; turned
# off by default to not distract the user: the focus in a terminal window
# should be on the output of commands, not on the prompt
#force_color_prompt=yes

if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
	# We have color support; assume it's compliant with Ecma-48
	# (ISO/IEC-6429). (Lack of such support is extremely rare, and such
	# a case would tend to support setf rather than setaf.)
	color_prompt=yes
    else
	color_prompt=
    fi
fi

if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt

# If this is an xterm set the title to user@host:dir
case "$TERM" in
xterm*|rxvt*)
    PS1="\[\e]0;${debian_chroot:+($debian_chroot)}\u@\h: \w\a\]$PS1"
    ;;
*)
    ;;
esac

# enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    #alias dir='dir --color=auto'
    #alias vdir='vdir --color=auto'

    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# some more ls aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Add an "alert" alias for long running commands.  Use like so:
#   sleep 10; alert
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# Alias definitions.
# You may want to put all your additions into a separate file like
# ~/.bash_aliases, instead of adding them here directly.
# See /usr/share/doc/bash-doc/examples in the bash-doc package.

if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

# enable programmable completion features (you don't need to enable
# this, if it's already enabled in /etc/bash.bashrc and /etc/profile
# sources /etc/bash.bashrc).
if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi

# pathの追加
PATH=$PATH:$HOME/usr/local/bin
PATH=$PATH:/home/linuxbrew/.linuxbrew/bin
PATH=$PATH:/usr/local/sbin
PATH=$PATH:/usr/local/bin
PATH=$PATH:/usr/sbin
PATH=$PATH:/usr/bin
PATH=$PATH:/sbin
PATH=$PATH:/bin
PATH=$PATH:/usr/games
PATH=$PATH:/usr/local/games
PATH=$PATH:/usr/local/go/bin
PATH=$PATH:/snap/bin
PATH=$PATH:$HOME/bin
PATH=$PATH:$HOME/.cargo/bin
PATH=$PATH:$HOME/.local/bin
PATH=$PATH:$HOME/.istioctl/bin
PATH=$PATH:$HOME/go/bin
export PATH

# homebrew
eval $(/home/linuxbrew/.linuxbrew/bin/brew shellenv)

# vim風
set editiong-mode vi
set show-mode-in-prompt on
set vi-ins-mode-string "+"
set vi-cmd-mode-string ":"

#screen用 PS1の設定
set_prompt_command () {
    screen_hstatus="${PWD} [${USER}@${HOSTNAME}]"
    screen_hstatus_str="\033]0;$screen_hstatus\007"
    screen_title="$(basename "$(pwd)")"
    screen_title_str="\033k\033\0134\033k/$screen_title\033\\"
    echo -ne "$screen_hstatus_str$screen_title_str"
}
if [ $(echo "$TERM" | grep -e 'xterm' -e 'screen' ) ]; then
    export PS1='\$ '
    export PROMPT_COMMAND="set_prompt_command"
else
    export PS1='\u@\h:\W\$ '
fi

# PS1の追加
PS1='$(__git_ps1)[\t]\n'$PS1

# Virtualenvwrapper
if [ -f /usr/local/bin/virtualenvwrapper.sh ]; then
export WORKON_HOME=$HOME/.virtualenvs
    source /usr/local/bin/virtualenvwrapper.sh
fi

function peco-select-history() {
    declare l=$(HISTTIMEFORMAT= history | sort -k1,1nr | perl -ne 'BEGIN { my @lines = (); } s/^\s*\d+\s*//; $in=$_; if (!(grep {$in eq $_} @lines)) { push(@lines, $in); print $in; }' | peco --query "$READLINE_LINE")
    READLINE_LINE="$l"
    READLINE_POINT=${#l}
}

function ghql() {
  local selected_file=$(ghq list --full-path | peco --query "$LBUFFER")
  if [ -n "$selected_file" ]; then
    if [ -t 1 ]; then
      echo ${selected_file}
      cd ${selected_file}
    fi
  fi
}

bind -x '"\C-r": peco-select-history'
bind -x '"\C-]": ghql'

gcop() {
  git branch -v -a --sort=-authordate |
    grep -v -e '->' -e '*' |
    peco |
    sed -r 's#^\s*(remotes/origin/)?([^ ]+)\s*.+#\2#g' |
    xargs git checkout
}
bind -x '"\C-b": gcop'

alias tmux="tmux new-session -A -s local"
export EDITOR="vim"

[ -s "$(brew --prefix asdf)/asdf.sh" ] && source "$(brew --prefix asdf)/asdf.sh"
[ -s "$(brew --prefix asdf)/asdf.sh" ] && source "$(brew --prefix asdf)/etc/bash_completion.d/asdf.bash"

if [ -d "/usr/local/etc/bash_completion.d" ]; then
  source /usr/local/etc/bash_completion.d/git-prompt.sh
  source /usr/local/etc/bash_completion.d/git-completion.bash
fi

if [ -d "$HOME/bin/google-cloud-sdk" ]; then
  source $HOME/bin/google-cloud-sdk/completion.bash.inc
  source $HOME/bin/google-cloud-sdk/path.bash.inc
fi


## use windows ssh-agent
export SSH_AUTH_SOCK=$HOME/.ssh/agent.sock
ss -a | grep -q $SSH_AUTH_SOCK
if [ $? -ne 0   ]; then
    rm -f $SSH_AUTH_SOCK
    ( setsid socat UNIX-LISTEN:$SSH_AUTH_SOCK,fork EXEC:"/mnt/c/npiperelay_windows/npiperelay.exe -ei -s //./pipe/openssh-ssh-agent",nofork & ) >/dev/null 2>&1
fi

# aws-cli
complete -C '/usr/local/bin/aws_completer' aws

## aws-vault
export AWS_VAULT_BACKEND="pass"

eval "$(direnv hook bash)"

KUBECONFIG="$HOME/.kube/config"
[ -e "$HOME/.kube/k3s.yaml" ] && KUBECONFIG="$KUBECONFIG:$HOME/.kube/k3s.yaml"
alias k3ctl="sudo k3s kubectl"

export KUBECONFIG

# The next line updates PATH for the Google Cloud SDK.
if [ -f '/home/tanaka/google-cloud-sdk/path.bash.inc' ]; then . '/home/tanaka/google-cloud-sdk/path.bash.inc'; fi

# The next line enables shell command completion for gcloud.
if [ -f '/home/tanaka/google-cloud-sdk/completion.bash.inc' ]; then . '/home/tanaka/google-cloud-sdk/completion.bash.inc'; fi

# tabtab source for packages
# uninstall by removing these lines
[ -f ~/.config/tabtab/__tabtab.bash ] && . ~/.config/tabtab/__tabtab.bash || true
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
;
