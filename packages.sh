#! /usr/bin/env bash
set -C
set -u
echo $(dirname $0)
ORIG_DIR=$(pwd)
cd $(dirname $0)


function read_list() {
	local list_path=$1
	local list=""
	for i in $(cat $list_path); do
		list="$list $i"
	done
	echo $list
}

function is_exist() {
	local command_name=$1
	type $command_name > /dev/null 2>&1
}

# -----  apt  -----
APT_LIST="packages/aptlist"
function apt_install() {
	local l=$(read_list $APT_LIST)
	sudo apt install -y $l
}

function apt_update() {
	sudo apt update
	sudo apt upgrade -y
}

# -----  brew  -----
BREW_LIST="packages/brewlist"
function brew_install() {
	local l=$(read_list $BREW_LIST)
	brew install $l
}

function brew_upgrade() {
	brew upgrade
}

# ----- go -----
GO_LIST="packages/golist"
function go_get() {
	local l=$(read_list $GO_LIST)
	for i in $l; do
		echo "go get -u $i"
	done
}

# ----- npm -----
NPM_LIST="packages/npmlist"
function npm_install() {
	local l=$(read_list $NPM_LIST)
	npm install -g $l
}

function npm_update() {
	local l=$(read_list $NPM_LIST)
	npm update -g $l
}

# ----- install script -----
SCRIPT_LIST="packages/scriptlist"
function script_install() {
	source $SCRIPT_LIST
}

case "$1" in
	"install")
		echo "install"
		is_exist apt && [ -e $APT_LIST ] && apt_install
		is_exist go && [ -e $GO_LIST ] && go_get
		is_exist brew && [ -e $BREW_LIST ] && brew_install
		is_exist npm && [ -e $NPM_LIST ] &&  npm_install
		[ -e $SCRIPT_LIST ] && script_install
		exit 0
		;;
	"update")
		echo "update"
		is_exist apt && [ -e $APT_LIST ] && apt_update
		is_exist go && [ -e $GO_LIST ] && go_get
		is_exist brew && [ -e $BREW_LIST ] && brew_upgrade
		is_exist npm && [ -e $NPM_LIST ] &&  npm_update
		[ -e $SCRIPT_LIST ] && script_install
		exit 0
		;;
	*)
		exit 1
		;;
esac

