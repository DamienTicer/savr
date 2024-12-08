# README

## Project Overview
This project is a savings tracker application that allows users to manage their savings goals, income sources, and expenses. It includes a frontend built with React, a backend using Node.js and Express, and a MySQL database.

---

## Prerequisites
Before running the project, ensure you have the following installed on your system:

1. [**Node.js**](https://nodejs.org/en) (version 16 or higher)
2. **npm** (comes with Node.js)
3. [**MySQL**](https://dev.mysql.com/downloads/mysql/) (version 8.0 or higher)
4. [**Git**](https://docs.github.com/en/desktop/installing-and-authenticating-to-github-desktop/installing-github-desktop) (optional, for cloning the repository)
5. A code editor like [Visual Studio Code](https://code.visualstudio.com/) (optional, but recommended).

   Restart your computer after your done downloading all of these.

---

## Setting Up the Project

### 1. Clone the Repository
Clone the project repository to your local machine using Git:
```bash
git clone <repository_url>
cd <repository_directory>
```

### 2. Install Dependencies
Navigate to the project directory and install the required dependencies for both the frontend and backend:

```bash
npm install
```

---

### 3. Set Up the MySQL Database

1. Open your MySQL client (e.g., MySQL Workbench or command line).
you can do this by either running the command:
   ```bash
   mysqld
   ```
   or
   ```bash
   cd "C:\Program Files\MySQL\MySQL Server <version>\bin"
   .\mysql -u root -p
   ```
   Then enter your password to mysql
   If you're having trouble, you may have a different path to your mysql. Also make sure that you input the version number where it says <version>

3. Create a new database:
   ```sql
   CREATE DATABASE savr;
   ```
4. Import the required tables and schema:
   ```sql
   USE savr;
   CREATE TABLE savings_goals (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NOT NULL,
       target_amount DECIMAL(10,2),
       deadline DATE
   );

   CREATE TABLE income_sources (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NOT NULL,
       source VARCHAR(255),
       amount DECIMAL(10,2),
       frequency VARCHAR(50)
   );

   CREATE TABLE expenses (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NOT NULL,
       category VARCHAR(255),
       amount DECIMAL(10,2),
       date DATE,
       notes TEXT
   );
   ```
5. Ensure the `id` fields in all tables are set to `AUTO_INCREMENT`.
    You can do so by inputting the following commands into your mysql terminal:
        ALTER TABLE income_sources MODIFY id INT AUTO_INCREMENT;
        ALTER TABLE savings_goals MODIFY id INT AUTO_INCREMENT;
        ALTER TABLE expenses MODIFY id INT AUTO_INCREMENT;

---

### 4. Configure Environment Variables
Enzure the `.env` file in the project directory has the following variables:

```env
DB_HOST=localhost
DB_USER=<your_mysql_username>
DB_PASSWORD=<your_mysql_password>
DB_DATABASE=savr
DB_PORT=3306
```

Replace `<your_mysql_username>` and `<your_mysql_password>` with your MySQL credentials.
DB_PORT=3306 should be the default port you have anyway
---

## Running the Application

### 1. Start the Backend
Keep the previous terminal open and open a new terminal
Navigate to the backend directory and start the server:
```bash
node server.js
```
You should see a message like:
```
Server running on port 3001
Database initialized!
```

### 2. Start the Frontend
Open another new terminal, navigate to the frontend directory, and start the React application:
```bash
npm start
```
Your browser should open at `http://localhost:3000`. If not, open it manually.

---

## Using the Application

1. **Register**: Create a new user account on the registration page.
2. **Login**: Use your credentials to log in.
3. **Dashboard**:
   - Add, edit, or delete savings goals, income sources, and expenses.
   - Changes will immediately reflect on the backend.

---

## Troubleshooting

1. **CORS Issues**: Ensure the backend includes appropriate CORS headers.
2. **Database Errors**: Verify your `.env` file and ensure the database is running.
3. **Port Conflicts**: If `3000` or `3001` are already in use, change the ports in `.env` and the frontend `package.json` (proxy setting).
4. **Blank Pages**: Ensure the frontend dependencies are installed correctly and the backend is running.

---

## Additional Notes
- Use `npm audit fix` to resolve potential vulnerabilities in dependencies.
- Contact the project maintainer for further support or questions.

Enjoy using the savings tracker application!
