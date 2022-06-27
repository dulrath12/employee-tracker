const inquirer = require('inquirer');
const mysql = require('mysql');
const cTable = require('console.table');
require('dotenv').config()

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.password,
    database: 'employeetracker',
});

startApp = () => {
    inquirer.prompt([
        {
            name: 'initialInquiry',
            type: 'rawlist',
            message: 'Welcome to the employee management program. What would you like to do?',
            choices: ['View all departments', 'View all roles', 'View all employees', 'View all employees by manager', 'Add a department', 'Add a role', 'Add an employee', 'Update employee\'s role', 'Update employee\'s manager', 'Remove a department', 'Remove a role', 'Remove an employee', 'View total salary of department', 'Exit program']
        }
    ]).then((response) => {
        switch (response.initialInquiry) {
            case 'View all departments':
                viewAllDepartments();    
                break;
            case 'View all roles':
                viewAllRoles();
                break;
            case 'View all employees':
                viewAllEmployees();
                break;
            case 'View all employees by manager':
                viewAllEmployeesByManager();
            break;
            case 'Add a department':
                addADepartment();
            break;
            case 'Add a role':
                addARole();
            break;
            case 'Add an employee':
                addAnEmployee();
            break;
            case 'Update employee\'s role':
                updateEmployeeRole();
            break;
            case 'Update employee\'s manager':
                updateEmployeesManager();
            break;
            case 'Remove a department':
                removeADepartment();
            break;
            case 'Remove a role':
                removeARole();
            break;
            case 'Remove an employee':
                removeAnEmployee();
            break;
            case 'View total salary of department':
                viewDepartmentSalary();
            break;
            case 'Exit program':
                connection.end();
                console.log('\n You have exited the employee management program. Thanks for using! \n');
                return;
            default:
                break;
        }
    })
}

viewAllDepartments = () => {
    connection.query(`SELECT * FROM department ORDER BY department_id ASC;`, (err, res) => {
        if (err) throw err;
        console.table('\n', res, '\n');
        startApp();
    })
};

viewAllRoles = () => {
    connection.query(`SELECT role.role_id, role.title, role.salary, department.department_name, department.department_id FROM role JOIN department ON role.department_id = department.department_id ORDER BY role.role_id ASC;`, (err, res) => {
        if (err) throw err;
        console.table('\n', res, '\n');
        startApp();
    })
};

viewAllEmployees = () => {
    connection.query(`SELECT e.employee_id, e.first_name, e.last_name, role.title, department.department_name, role.salary, CONCAT(m.first_name, ' ', m.last_name) manager FROM employee m RIGHT JOIN employee e ON e.manager_id = m.employee_id JOIN role ON e.role_id = role.role_id JOIN department ON department.department_id = role.department_id ORDER BY e.employee_id ASC;`, (err, res) => {
        if (err) throw err;
        console.table('\n', res, '\n');
        startApp();
    })
};

viewAllEmployeesByManager = () => {
    connection.query(`SELECT employee_id, first_name, last_name FROM employee ORDER BY employee_id ASC;`, (err, res) => {
        if (err) throw err;
        let managers = res.map(employee => ({name: employee.first_name + ' ' + employee.last_name, value: employee.employee_id }));
        inquirer.prompt([
            {
            name: 'manager',
            type: 'rawlist',
            message: 'Which manager would you like to see the employee\'s of?',
            choices: managers   
            },
        ]).then((response) => {
            connection.query(`SELECT e.employee_id, e.first_name, e.last_name, role.title, department.department_name, role.salary, CONCAT(m.first_name, ' ', m.last_name) manager FROM employee m RIGHT JOIN employee e ON e.manager_id = m.employee_id JOIN role ON e.role_id = role.role_id JOIN department ON department.department_id = role.department_id WHERE e.manager_id = ${response.manager} ORDER BY e.employee_id ASC`, 
            (err, res) => {
                if (err) throw err;
                console.table('\n', res, '\n');
                startApp();
            })
        })
    })
}

