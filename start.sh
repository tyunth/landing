#!/bin/bash

# Math Landing - Linux Startup Script
# Для запуска на Linux сервере

echo "Starting Math Landing Project..."
echo "=============================="

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Проверка наличия npm
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    echo "Please install npm with Node.js"
    exit 1
fi

echo "✓ Node.js and npm are installed"

# Установка зависимостей сервера
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Проверка наличия PostgreSQL
if command -v psql &> /dev/null; then
    echo "✓ PostgreSQL found"
else
    echo "⚠ PostgreSQL not found. Database setup will be skipped"
fi

echo ""
echo "Starting Math Landing Server..."
echo "Server will be available at: http://localhost:1000"
echo ""

# Запуск сервера
node server/server.js

echo "Server stopped."