#!/bin/bash

# Math Landing - Database Setup Script for Linux
# Для настройки PostgreSQL базы данных

echo "Setting up Math Landing Database..."
echo "=================================="

# Проверка наличия psql
if ! command -v psql &> /dev/null; then
    echo "Error: PostgreSQL psql is not installed"
    echo "Please install PostgreSQL from your package manager"
    echo "Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "CentOS/RHEL: sudo yum install postgresql postgresql-server"
    exit 1
fi

echo "✓ PostgreSQL psql is installed"

# Запрос параметров подключения
read -p "Enter database host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter database port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Enter database username: " DB_USER
if [ -z "$DB_USER" ]; then
    echo "Error: Username is required"
    exit 1
fi

read -p "Enter database name (default: math_landing): " DB_NAME
DB_NAME=${DB_NAME:-math_landing}

echo ""
echo "Creating database and running migrations..."
echo ""

# Создание базы данных
echo "Creating database $DB_NAME..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ Database $DB_NAME created successfully"
else
    echo "⚠ Database $DB_NAME already exists or creation failed"
fi

echo ""
echo "Running database migrations..."
echo ""

# Запуск миграций
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f server/schema.sql

if [ $? -eq 0 ]; then
    echo "✓ Database setup completed successfully!"
    echo ""
    echo "Database Configuration:"
    echo "  Database: $DB_NAME"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  User: $DB_USER"
    echo ""
    echo "You can now run './start.sh' to start the application"
else
    echo "✗ Error running migrations"
    echo "Please check your database connection"
    echo "Make sure PostgreSQL server is running and credentials are correct"
fi

echo ""