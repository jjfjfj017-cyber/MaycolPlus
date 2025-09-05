#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'
BOLD='\033[1m'

COLS=$(tput cols 2>/dev/null || echo 80)
DETECTED_OS=""
PKG_MANAGER=""
INSTALL_CMD=""

center_text() {
    local text="$1"
    local width=$COLS
    local len=${#text}
    local spaces=$(( (width - len) / 2 ))
    printf "%*s%s\n" $spaces "" "$text"
}

print_ascii_maycolplus() {
    clear
    echo
    if [ $COLS -ge 60 ]; then
        echo -e "${WHITE}"
        center_text "██╗  ██╗ █████╗ ██╗   ██╗ ██████╗ ██████╗ ██╗     ██████╗ ██╗   ██╗███████╗"
        center_text "██║ ██╔╝██╔══██╗╚██╗ ██╔╝██╔════╝██╔═══██╗██║     ██╔══██╗██║   ██║██╔════╝"
        center_text "█████╔╝ ███████║ ╚████╔╝ ██║     ██║   ██║██║     ██████╔╝██║   ██║███████╗"
        center_text "██╔═██╗ ██╔══██║  ╚██╔╝  ██║     ██║   ██║██║     ██╔═══╝ ██║   ██║╚════██║"
        center_text "██║  ██╗██║  ██║   ██║   ╚██████╗╚██████╔╝███████╗██║     ╚██████╔╝███████║"
        center_text "╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═════╝ ╚══════╝╚═╝      ╚═════╝ ╚══════╝"
    else
        center_text "╔╦╗┌─┐┬ ┬┌─┐┌─┐┬  ╔═╗┬  ┬ ┬┌─┐"
        center_text "║║║├─┤└┬┘│  │ ││  ╠═╝│  │ │└─┐"
        center_text "╩ ╩┴ ┴ ┴ └─┘└─┘┴─╝╩  ┴─╘└─┘└─┘"
    fi
    
    echo -e "${NC}"
    echo
    local rainbow_text="Hecho por SoyMaycol<3"
    local colors=(31 33 32 36 34 35)
    local color_index=0
    local centered_spaces=$(( (COLS - ${#rainbow_text}) / 2 ))
    printf "%*s" $centered_spaces ""
    
    for (( i=0; i<${#rainbow_text}; i++ )); do
        printf "\033[1;${colors[$color_index]}m${rainbow_text:$i:1}"
        color_index=$(( (color_index + 1) % ${#colors[@]} ))
    done
    echo -e "${NC}"
    echo
}

hanako_speak() {
    local message="$1"
    echo -e "${PURPLE}┌─────────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${PURPLE}│${WHITE} Hanako-kun: ${YELLOW}$message ${WHITE}ufufu~ (◕‿◕)${PURPLE} │${NC}"
    echo -e "${PURPLE}└─────────────────────────────────────────────────────────────────────┘${NC}"
    echo
}

detect_os() {
    if [ -n "$TERMUX_VERSION" ] || [ -d "/data/data/com.termux" ]; then
        DETECTED_OS="termux"
        PKG_MANAGER="pkg"
        INSTALL_CMD="pkg install -y"
    elif [ -f "/etc/debian_version" ]; then
        if grep -q "Ubuntu" /etc/os-release 2>/dev/null; then
            DETECTED_OS="ubuntu"
        else
            DETECTED_OS="debian"
        fi
        PKG_MANAGER="apt"
        INSTALL_CMD="apt update && apt install -y"
    else
        DETECTED_OS="unknown"
    fi
}

confirm_os() {
    if [ "$DETECTED_OS" = "unknown" ]; then
        hanako_speak "¿Cuál es tu sistema operativo? 1) Termux 2) Ubuntu 3) Debian"
        echo -ne "${YELLOW}Selecciona (1-3): ${NC}"
        read -r choice
        
        case $choice in
            1)
                DETECTED_OS="termux"
                PKG_MANAGER="pkg"
                INSTALL_CMD="pkg install -y"
                ;;
            2)
                DETECTED_OS="ubuntu"
                PKG_MANAGER="apt"
                INSTALL_CMD="apt update && apt install -y"
                ;;
            3)
                DETECTED_OS="debian"
                PKG_MANAGER="apt"
                INSTALL_CMD="apt update && apt install -y"
                ;;
            *)
                hanako_speak "Opción inválida, saliendo..."
                exit 1
                ;;
        esac
    fi
}

check_and_install_nodejs() {
    if command -v node >/dev/null 2>&1; then
        hanako_speak "Node.js ya está instalado, continuando..."
    else
        hanako_speak "Instalando Node.js..."
        if [ "$DETECTED_OS" = "termux" ]; then
            $INSTALL_CMD nodejs >/dev/null 2>&1
        else
            apt update >/dev/null 2>&1
            $INSTALL_CMD nodejs npm >/dev/null 2>&1
        fi
        
        if ! command -v node >/dev/null 2>&1; then
            hanako_speak "Error al instalar Node.js"
            exit 1
        fi
    fi
}

check_and_install_git() {
    if command -v git >/dev/null 2>&1; then
        hanako_speak "Git ya está instalado, continuando..."
    else
        hanako_speak "Instalando Git..."
        $INSTALL_CMD git >/dev/null 2>&1
        
        if ! command -v git >/dev/null 2>&1; then
            hanako_speak "Error al instalar Git"
            exit 1
        fi
    fi
}

clone_and_setup_bot() {
    if [ -d "MaycolPlus" ]; then
        hanako_speak "MaycolPlus ya existe, instalando dependencias..."
        cd MaycolPlus
    else
        hanako_speak "Clonando MaycolPlus..."
        git clone https://github.com/SoySapo6/MaycolPlus.git >/dev/null 2>&1
        
        if [ -d "MaycolPlus" ]; then
            cd MaycolPlus
        else
            hanako_speak "Error al clonar el repositorio"
            exit 1
        fi
    fi
    
    hanako_speak "Instalando dependencias, espera un momento..."
    npm install --force >/dev/null 2>&1
}

main() {
    print_ascii_maycolplus
    hanako_speak "¡Hola! Te ayudaré a instalar MaycolPlus, ara ara~"
    
    detect_os
    confirm_os
    check_and_install_nodejs
    check_and_install_git
    clone_and_setup_bot
    
    cd ..
    
    echo
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${WHITE}                        ¡INSTALACIÓN COMPLETADA!                          ${GREEN}║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    hanako_speak "¡Listo! Para iniciar ejecuta: cd MaycolPlus && npm start"
}

main
