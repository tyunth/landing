#!/bin/bash

# Math Landing - Quick Start Script for Linux
# Полная установка и запуск проекта

echo "========================================"
echo "     Math Landing - Quick Start"
echo "========================================"
echo ""
echo "This will:"
echo "1. Install dependencies"
echo "2. Setup database (optional)"
echo "3. Start the server"
echo ""

read -p "Press Enter to continue..."

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

# Проверка наличия PostgreSQL
if command -v psql &> /dev/null; then
    echo "✓ PostgreSQL found. Proceeding with database setup..."
    echo ""
    
    # Запуск настройки базы данных
    ./setup-db.sh
    
    if [ $? -ne 0 ]; then
        echo "Database setup failed. Continuing without database..."
        echo ""
    fi
else
    echo "⚠ PostgreSQL not found. Database setup will be skipped"
    echo "Please install PostgreSQL if you want to use the database features"
    echo ""
    read -p "Continue without database setup? (y/n): " CONTINUE
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
        echo "Setup cancelled"
        exit 1
    fi
fi

echo ""
echo "Installing dependencies..."
cd server
npm install
cd ..

echo ""
echo "Starting Math Landing Server..."
echo "================================"
echo "Server URL: http://localhost:1000"
echo "================================"
echo ""

# Открытие браузера (если доступно)
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:1000" &
elif command -v open &> /dev/null; then
    open "http://localhost:1000" &
fi

# Запуск сервера
node server/server.js

echo "Server stopped."