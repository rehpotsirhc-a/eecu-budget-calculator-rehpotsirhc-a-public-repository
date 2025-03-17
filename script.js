const careerSelect = document.getElementById("career");
const salary = document.getElementById("salary");
const kidsMoney = document.getElementById("kid-spending");
const houseMoney = document.getElementById("house-spending");

let monthlyIncome = 0;
let nmiDisplayed = false; // Flag to check if .nmi has been displayed

// Function to process salary with the given mathematical operation
function processSalary(salary) {
    return ((salary - 180) / 12) * 0.67 + 10;
}

// When the selected career changes, update the salary input and apply the operation
careerSelect.addEventListener("change", () => {
    let rawSalary = parseFloat(careerSelect.value) || 0; // Convert to number
    monthlyIncome = processSalary(rawSalary); // Process salary

    salary.value = `$${monthlyIncome.toFixed(2)}`; // Display processed salary
    nmiDisplayed = false; // Reset flag when changing careers
    updateIncome(true); // Update income and .nmi
});

// ALL THIS DOES IS UPDATE INCOME
kidsMoney.addEventListener("input", () => updateIncome(false));
houseMoney.addEventListener("input", () => updateIncome(false));

document.querySelectorAll('.pos input, .neg input').forEach(inputElement => {
    inputElement.addEventListener('input', () => updateIncome(false));
});

// THIS IS WHAT DOES THE ACTUAL MATH
function updateIncome(updateNmi) {
    let baseSalary = parseFloat(salary.value.replace(/[^0-9.-]+/g, "")) || 0; // Ensure salary is a valid number
    let processedSalary = processSalary(baseSalary); // Process salary using the given formula
    let displayedIncome = processedSalary; // Start with the processed salary

    displayedIncome -= parseFloat(kidsMoney.value) || 0;
    displayedIncome -= parseFloat(houseMoney.value) || 0;

    // Add values from elements with class 'pos'
    document.querySelectorAll('.pos input').forEach(inputElement => {
        displayedIncome += parseFloat(inputElement.value) || 0;
    });

    // Subtract values from elements with class 'neg'
    document.querySelectorAll('.neg input').forEach(inputElement => {
        displayedIncome -= parseFloat(inputElement.value) || 0;
    });

    // Removes strange rounding error
    displayedIncome = Math.round(displayedIncome);

    console.log(displayedIncome);

    // Display the processed salary inside .nmi once (when career is selected)
    if (updateNmi && !nmiDisplayed) {
        document.querySelector('.nmi').textContent = `Net Monthly Income: $${processedSalary.toFixed(2)}`;
        nmiDisplayed = true; // Prevent further updates
    }

    // Display the processed salary inside .finalbal
    document.querySelector('.finalbal').textContent = `Final Balance: $${displayedIncome.toFixed(2)}`;
}

// Initialize the web page when the DOM is ready
document.addEventListener('DOMContentLoaded', init);

careerSelect.addEventListener("change", () => {
    salary.value = `$${careerSelect.value}`;
    monthlyIncome = taxes(careerSelect.value);
    nmiDisplayed = false; // Reset flag when changing careers
    updateIncome();
});

let utils = {}; // Create a namespace for our utility functions

// Get function to make an HTTP GET request
utils.get = (url) => {
    return new Promise(function (resolve, reject) {
        let request = new XMLHttpRequest();
        request.open('GET', url);

        request.onload = function () {
            if (request.status == 200) { // HTTP: OK
                console.log('Response OK');
                resolve(request.response);
            } else {
                reject(Error(`promise error with ${request.status}`));
            }
        };

        request.onerror = function (error) {
            reject(Error(`Network Error with ${url}: ${error}`));
        };

        request.send();
    });
}

// Get JSON function to retrieve data from the server
utils.getJSON = async function (url) {
    let string = null;
    try {
        string = await utils.get(url);
    } catch (error) {
        console.log(error);
    }
    let data = JSON.parse(string);
    return data;
}

async function init() {
    let root = document.querySelector('#root');
    let url = 'https://eecu-data-server.vercel.app/data/2024';
    let occupations = null;

    try {
        occupations = await utils.getJSON(url);
    } catch (error) {
        root.style.color = 'red';
        root.textContent = `error: ${error}`;
    }

    root.innerHTML = buildDropdown(occupations);
    addSelectListener();  // Add event listener after dropdown is rendered
    addNumberListeners(); // Add event listeners for number inputs
}

function buildDropdown(jobs) {
    let html = '<select id="occupationSelect">';

    // Add a default "Select an occupation" option
    html += '<option value="" disabled selected>Select an Occupation</option>';

    // Loop through each job and create an option element for the dropdown
    for (let job of jobs) {
        html += `<option value="${job.salary}">${job.occupation}</option>`;
    }

    // Close the select element
    html += '</select>';

    return html;
}

// Function to add an event listener to the select element
function addSelectListener() {
    let selectElement = document.getElementById('occupationSelect');
    const salaryInput = document.getElementById('salary'); // Reference to the salary input field

    // Event listener for changes in the select element
    selectElement.addEventListener('change', function () {
        // Get the salary of the selected occupation
        let selectedSalary = selectElement.value;

        // Set the value of the salary input field to the selected salary
        salaryInput.value = `$${selectedSalary}`;


        updateSalary(); // Update salary based on current inputs
    });
}

// Add event listeners to the "number" inputs
function addNumberListeners() {
    // Get all inputs with ids containing "number"
    const numberInputs = document.querySelectorAll('input[id*="number"]');

    numberInputs.forEach(input => {
        input.addEventListener('input', updateSalary); // Add event listener to each "number" input
    });
}

// Function to update the salary after subtracting values from "number" inputs
function updateSalary() {
    const salaryInput = document.getElementById('salary');
    const selectElement = document.getElementById('occupationSelect');

    let salary = parseFloat(selectElement.value); // Get the selected salary value
    if (isNaN(salary)) {
        console.log("Invalid salary");
        return;
    }

    // Get all the "number" inputs and subtract their values from the salary
    const numberInputs = document.querySelectorAll('input[id*="number"]');

    numberInputs.forEach(input => {
        let inputValue = parseFloat(input.value);
        if (!isNaN(inputValue)) {
            salary -= inputValue; // Subtract the value from the salary
        }
    });

    // Set the updated salary value in the input
    salaryInput.value = `$${salary.toFixed(2)}`;

    // Log the updated salary
    console.log(salary);
}



// Initialize the web page when the DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Function to generate a random deduction and update the final balance
function generateRandomDeduction() {
    const randomDeduction = Math.floor(Math.random() * 500) + 1; // Generates a random number between 1 and 500
    let finalBalance = parseFloat(document.querySelector('.finalbal').textContent.replace(/[^0-9.-]+/g, "")) || 0;

    finalBalance -= randomDeduction; // Deduct the random amount

    // Update the final balance displayed
    document.querySelector('.finalbal').textContent = `Final Balance: $${finalBalance.toFixed(2)}`;
}

// Add event listener to the "Generate Random Deduction" button
document.getElementById('random-deduction-btn').addEventListener('click', generateRandomDeduction);
