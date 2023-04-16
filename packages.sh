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


# ----- init -----
INIT_SCRIPT="packages/initialize"
function initialize() {
	for script in $(find $INIT_SCRIPT); do
		echo $script
		source $script
	done
}

# -----  apt  -----
APT_LIST="packages/aptlist"
function apt_before() {
	source $APT_LIST.before
	sudo apt update

}
function apt_install() {
	apt_before
	local l=$(read_list $APT_LIST)
	sudo apt install -y $l
}

function apt_update() {
	apt_before
	sudo apt upgrade -y
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

# ----- ghq -----
GHQ_LIST="packages/ghqlist"
function ghq_get() {
	local l=$(read_list $GHQ_LIST)
	for i in $l; do
		ghq get -u $i
	done
}

# ----- install script -----
SCRIPT_LIST="packages/scriptlist"
function script_install() {
	source $SCRIPT_LIST
}

case "$1" in
	"init")
		initialize
		exit 0
		;;
	"install")
		echo "install"
		is_exist apt && [ -e $APT_LIST ] && apt_install
		[ -e $SCRIPT_LIST ] && script_install
		is_exist npm && [ -e $NPM_LIST ] &&  npm_install
		is_exist ghq && [ -e $GHQ_LIST ] && ghq_get
		exit 0
		;;
	"update")
		echo "update"
		is_exist apt && [ -e $APT_LIST ] && apt_update
		is_exist npm && [ -e $NPM_LIST ] &&  npm_update
		is_exist ghq && [ -e $GHQ_LIST ] && ghq_get
		[ -e $SCRIPT_LIST ] && script_install
		exit 0
		;;
	*)
		exit 1
		;;
esac

