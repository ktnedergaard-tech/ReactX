#!/bin/bash
# Dobbeltklik denne fil for at starte ReactX' parrings-server lokalt.
# Kræver Node.js (gratis, https://nodejs.org – vælg "LTS").
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js blev ikke fundet på denne computer."
  echo "Hent det gratis på https://nodejs.org (vælg LTS-versionen) og prøv igen."
  read -r -p "Tryk Enter for at lukke..." _
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Første gang: installerer det, serveren skal bruge..."
  npm install || { read -r -p "Noget gik galt under installationen. Tryk Enter for at lukke..." _; exit 1; }
  echo ""
fi

echo "==================================================="
echo " ReactX parrings-server starter..."
echo "==================================================="
echo ""
npm start

echo ""
read -r -p "Serveren er stoppet. Tryk Enter for at lukke..." _
