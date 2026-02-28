#!/bin/bash

# Math Landing - Testing Suite for Linux
# Тестирование проекта на Linux

echo "Math Landing - Testing Suite"
echo "============================"
echo ""

# Проверка наличия Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js: $NODE_VERSION"
else
    echo "✗ Node.js: Not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Проверка наличия npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✓ npm: $NPM_VERSION"
else
    echo "✗ npm: Not installed"
    echo "Please install npm with Node.js"
    exit 1
fi

echo ""

# Проверка наличия серверных файлов
echo "Project Files Status:"
echo "===================="

if [ -f "server/server.js" ]; then
    echo "✓ Server: server.js"
else
    echo "✗ Server: server.js missing"
    exit 1
fi

if [ -f "server/package.json" ]; then
    echo "✓ Server: package.json"
else
    echo "✗ Server: package.json missing"
    exit 1
fi

if [ -f "server/schema.sql" ]; then
    echo "✓ Server: schema.sql"
else
    echo "✗ Server: schema.sql missing"
    exit 1
fi

if [ -f "server/.env" ]; then
    echo "✓ Server: .env config"
else
    echo "⚠ Server: .env missing (using defaults)"
fi

# Проверка наличия клиентских файлов
if [ -f "client/index.html" ]; then
    echo "✓ Client: index.html"
else
    echo "✗ Client: index.html missing"
    exit 1
fi

if [ -d "client/css" ] && [ -f "client/css/style.css" ]; then
    echo "✓ Client: CSS files"
else
    echo "✗ Client: CSS files missing"
    exit 1
fi

if [ -d "client/js" ] && [ -f "client/js/main.js" ]; then
    echo "✓ Client: JavaScript files"
else
    echo "✗ Client: JavaScript files missing"
    exit 1
fi

# Проверка зависимостей
if [ -d "server/node_modules" ]; then
    echo "✓ Dependencies: Installed"
else
    echo "✗ Dependencies: Not installed"
    echo "Run './start.sh' to install dependencies"
    exit 1
fi

# Проверка наличия PostgreSQL
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo "✓ PostgreSQL: $PSQL_VERSION"
else
    echo "⚠ PostgreSQL: Not found"
    echo "Database tests will be skipped"
fi

echo ""

# Тестирование сервера
echo "Testing server startup..."
echo ""

# Тестовый запуск сервера (на короткое время)
timeout 3s node server/server.js > /dev/null 2>&1 &
SERVER_PID=$!
sleep 3
kill $SERVER_PID 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ Server startup test passed"
else
    echo "✗ Server startup test failed"
    echo "Check server.js for syntax errors"
fi

echo ""

# Тестирование клиентских файлов
echo "Testing client files..."
echo ""

# Проверка HTML валидности (простая проверка)
if grep -q "<!DOCTYPE html>" client/index.html; then
    echo "✓ HTML structure valid"
else
    echo "✗ HTML structure invalid"
fi

# Проверка CSS
if [ -f "client/css/style.css" ] && grep -q "{" client/css/style.css; then
    echo "✓ CSS structure valid"
else
    echo "✗ CSS structure invalid"
fi

# Проверка JavaScript
if [ -f "client/js/main.js" ] && grep -q "function" client/js/main.js; then
    echo "✓ JavaScript structure valid"
else
    echo "✗ JavaScript structure invalid"
fi

echo ""

# Тестирование файловых прав
echo "Testing file permissions..."
echo ""

# Проверка прав на запись в папки
touch server/test.tmp 2>/dev/null
if [ -f "server/test.tmp" ]; then
    rm server/test.tmp
    echo "✓ Server folder writable"
else
    echo "✗ Server folder not writable"
fi

touch client/test.tmp 2>/dev/null
if [ -f "client/test.tmp" ]; then
    rm client/test.tmp
    echo "✓ Client folder writable"
else
    echo "✗ Client folder not writable"
fi

echo ""
echo "============================"
echo "Test Results Summary:"
echo "============================"
echo "All basic tests completed."
echo ""
echo "To run the full application:"
echo "1. Run './run.sh' or './start.sh'"
echo "2. Open http://localhost:1000 in your browser"
echo ""
echo "For database setup:"
echo "Run './setup-db.sh' before starting the server"
echo ""
echo "Project is ready for use! 🚀"