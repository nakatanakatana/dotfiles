#!/bin/bash

curl -sSfL https://raw.githubusercontent.com/aquaproj/aqua-installer/v3.1.1/aqua-installer | bash
export PATH=$PATH:${AQUA_ROOT_DIR:-${XDG_DATA_HOME:-$HOME/.local/share}/aquaproj-aqua}/bin
export AQUA_GLOBAL_CONFIG=$HOME/aqua.yaml
aqua i -l
chezmoi init --apply https://github.com/nakatanakatana/dotfiles.git
