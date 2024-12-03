
//----INITIALIZE VARIABLES----
const totalTime = 60; //set total length of quiz

let currentQuestionIndex = 0;
let timer = totalTime; //set timer
let timerInterval;
let selectedQuestions = []; // Array to hold the randomly selected questions for each quiz session
let userAnswers = []; // Array to store user answers and feedback
let totalQuestions = 5; //total number of questions we want for our quiz
let questionsFilepath = './questions.json';
let questions = []; //define the questions array so it can be initialized in the import function

let allUsedQuestions = JSON.parse(localStorage.getItem('usedQuestions')) || []; // Retrieve used questions from localStorage

init();

//------FUNCTIONS-------

//Function to initialize the program
async function init() {
    await importQuestionData(questionsFilepath);
    startQuiz();
  }

// Start the quiz
function startQuiz() {
    currentQuestionIndex = 0;  // Reset index for new quiz
    selectedQuestions = getRandomQuestions(questions, totalQuestions); // Get selected amount of random questions

    // Store current questions
    localStorage.setItem('currentQuestions', JSON.stringify(selectedQuestions));

    // Mark these questions as used
    allUsedQuestions = [...allUsedQuestions, ...selectedQuestions.map(q => q.questionText)];

    // Store updated list of used questions in localStorage
    localStorage.setItem('usedQuestions', JSON.stringify(allUsedQuestions));

    initializeUserAnswers(totalQuestions);
    displayQuestion();
    startTimer();
}

// Function to initialize the userAnswers Array
function initializeUserAnswers(totalQuestions) {
    
    for(i = 0; i < totalQuestions; i++){
        userAnswers.push({
            questionText: selectedQuestions[i].questionText,
            selectedAnswer: null,
            correctAnswer: Array.isArray(selectedQuestions[i].correctAnswer)
            ? selectedQuestions[i].correctAnswer.map(index => selectedQuestions[i].options[index]).join(', ')
             : selectedQuestions[i].options[selectedQuestions[i].correctAnswer],
            feedback: `Incorrect. ${selectedQuestions[i].feedback}`
        });
    }

    console.log('Questions Array:' + questions);
}

// Function to import question data
async function importQuestionData(filename) {
    try {
      const response = await fetch(filename);
      const data = await response.json();
      questions = data; // Assign fetched data to global questions array
    } catch (error) {
      console.error('Error:', error);
    }
  }

// Function to randomly select a set of questions without duplicates and without repetition from previous quizzes
function getRandomQuestions(questionBank, numQuestions) {
    // Filter out previously used questions
    const availableQuestions = questionBank.filter(q => !allUsedQuestions.includes(q.questionText));

    // If there are enough available questions, pick 5 random questions
    if (availableQuestions.length >= numQuestions) {
        const selectedQuestions = [];
        while (selectedQuestions.length < numQuestions) {
            const randomIndex = Math.floor(Math.random() * availableQuestions.length);
            const selectedQuestion = availableQuestions.splice(randomIndex, 1)[0];
            selectedQuestions.push(selectedQuestion);
        }
        return selectedQuestions;
    } 
    
    else {
        // If there are not enough new questions, reset the used questions array 
        allUsedQuestions = [];

        // Call the function again
        return getRandomQuestions(questionBank, numQuestions);
    }
} 


function displayQuestion() {
    const question = selectedQuestions[currentQuestionIndex]; // Use selectedQuestions array
    console.log(question);
    document.querySelector('.question-text').textContent = question.questionText;
    const optionsList = document.querySelector('.options-list');
    optionsList.innerHTML = ''; // Clear the previous options

    // Display options as radio buttons or checkboxes based on question type
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('option');

        const input = document.createElement('input');
        const label = document.createElement('label');

        // Set input type and name based on question type
        input.type = question.questionType === "select_all" ? "checkbox" : "radio";
        input.name = "options";  // Name should be the same for all options in the question
        input.value = index;
        label.textContent = option;

        // Ensure the label is associated with the input by setting the 'for' attribute
        label.setAttribute('for', input.id); 
        input.id = `option-${index}`; // Give the input a unique ID

        // Apply a larger size to the checkbox/radio button
        input.style.transform = 'scale(1.5)';  // Make the checkbox/radio button bigger (scale factor)
        input.style.marginRight = '10px'; // Add some space between the button and the label

        // Append the input and label to the option div
        optionDiv.appendChild(input);
        optionDiv.appendChild(label);
        optionsList.appendChild(optionDiv);

        // Allow clicking on the option's label to select the checkbox/radio button
        label.addEventListener('click', function() {
            input.checked = true;
        });
    
    });


    // Add submit button after options are displayed
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Answer';
    submitButton.classList.add('submit-button');

    // Apply styles directly to match the .next-button styles
    submitButton.style.padding = '12px 20px';
    submitButton.style.fontSize = '18px';
    submitButton.style.fontWeight = '600';
    submitButton.style.background = '#007bff';
    submitButton.style.border = 'none';
    submitButton.style.borderRadius = '5px';
    submitButton.style.color = '#fff';
    submitButton.style.cursor = 'pointer';
    submitButton.style.transition = 'background 0.3s ease';

    // Disable the Submit Answer button initially
    submitButton.disabled = true;

    // Set the onClick event for submit button
    submitButton.onclick = submitAnswer;

    // Append the button to the options list
    optionsList.appendChild(submitButton);

    // Disable the Next button until an answer is submitted
    document.querySelector('.next-button').disabled = true;

    // Update question count in the footer
    document.querySelector('.question-count').textContent = `Question ${currentQuestionIndex + 1} of ${selectedQuestions.length}`;

    // Check if any option is selected to enable Submit Answer button
    const options = document.querySelectorAll('.options-list input');
    options.forEach(option => {
        option.addEventListener('change', () => {
            // Enable submit button if any option is selected
            submitButton.disabled = false;
        });
    });
}

// Handle answer submission
function submitAnswer() {
    const question = selectedQuestions[currentQuestionIndex];
    const options = document.querySelectorAll('.options-list input');
    let selectedIndices = [];

    options.forEach((option, index) => {
        if (option.checked) selectedIndices.push(index);
    });

    // Determine if the answer is correct
    const isCorrect = Array.isArray(question.correctAnswer)
        ? selectedIndices.length && selectedIndices.every(i => question.correctAnswer.includes(i)) &&
          question.correctAnswer.length === selectedIndices.length
        : selectedIndices[0] === question.correctAnswer;

    options.forEach((option, index) => {
        option.disabled = true;
        option.parentNode.classList.add(
            (Array.isArray(question.correctAnswer) && question.correctAnswer.includes(index)) || 
            question.correctAnswer === index 
                ? 'correct' : 'incorrect'
        );
    });

    const feedback = document.createElement('p');
    feedback.textContent = isCorrect ? `Correct! ${question.feedback}` : `Incorrect. ${question.feedback}`;
    feedback.style.color = isCorrect ? 'green' : 'red';
    document.querySelector('.quiz-box').appendChild(feedback);

    // Store the answer and feedback in the userAnswers array
    userAnswers[currentQuestionIndex].selectedAnswer = selectedIndices;
    userAnswers[currentQuestionIndex].feedback = isCorrect ? `Correct! ${question.feedback}` : `Incorrect. ${question.feedback}`;

    // If it's the last question, show the results button and remove the next button
    if (currentQuestionIndex === selectedQuestions.length - 1) {
        // Remove the Next button
        document.querySelector('.next-button').style.display = 'none';

        // Enable the Show Results button and make it visible
        const resultsButton = document.getElementById('resultsButton');
        resultsButton.disabled = false;
        resultsButton.style.display = 'inline-block';  // Show the button
    } else {
        // Enable the Next button after submitting answer
        document.querySelector('.next-button').disabled = false;
    }

    // Remove submit button after submission
    document.querySelector('.submit-button').remove();
}

// Move to the next question
function moveToNextQuestion() {
    const feedback = document.querySelector('.quiz-box p');
    if (feedback) feedback.remove();

    if (currentQuestionIndex < selectedQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
        console.log('display next question');
    } else {
        console.log('end quiz');
        endQuiz(); // If last question, end quiz and show results button
    }
}

// Start timer for the quiz
function startTimer() {
    timer = totalTime; // Reset timer for each quiz
    clearInterval(timerInterval); // Clear previous timer if any
    timerInterval = setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        document.getElementById('timer').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        timer--;

        if (timer < 0) {
            clearInterval(timerInterval);
            endQuiz();
            window.location.href = 'result-box.html';
        }

    }, 1000);
}

// Function to display the quiz duration on the rules page
function displayQuizTime() {
    // Get the element where the quiz time should be displayed
    const quizDurationElement = document.getElementById('quiz-duration');
    if (quizDurationElement) {
        // Format the totalTime and update the text content of the element
        quizDurationElement.textContent = formatTime(totalTime);
    }
}

// Function to format the time into minutes and seconds
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
}

function calculateScoreSummary() {
    console.log('enter score summary');
    let score = 0;
    selectedQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        console.log(`Question ${index + 1}:`, question);
        console.log(`User Answer:`, userAnswer);
        
        let isCorrect = false;
        
        // Check if the user has answered the question
        if (userAnswer && userAnswer.selectedAnswer !== null){
            console.log(`Correct Answer:`, question.correctAnswer);
            
            // Check if the user's answer matches the correct answer
            if (Array.isArray(question.correctAnswer)) {
                console.log(`User selected answers:`, userAnswer.selectedAnswer);
                isCorrect = userAnswer.selectedAnswer.every(answer => question.correctAnswer.includes(answer)) &&
                    userAnswer.selectedAnswer.length === question.correctAnswer.length;
            } 
            else {
                console.log(`User selected answer:`, userAnswer.selectedAnswer);
                console.log(`Correct option:`, question.correctAnswer);
                isCorrect = userAnswer.selectedAnswer[0] === question.correctAnswer;
            }
            
            if (isCorrect) {
                console.log(`Correct!`);
                score++;
            } else {
                console.log(`Incorrect.`);
            }
        }
        
    });
    
    console.log(`Final Score:`, score);
    
    // Store the score summary in localStorage
    const scoreSummary = {
        score: score,
        totalQuestions: selectedQuestions.length,
        detailedResults: userAnswers
    };

    console.log(`Score Summary:`, scoreSummary);

    // Update the score in localStorage and in the display
    localStorage.setItem('scoreSummary', JSON.stringify(scoreSummary));
}

function endQuiz() {
    clearInterval(timerInterval);

    // Store the score summary in localStorage to show on result-box.html
    calculateScoreSummary();  // You can call this to calculate and store score

    // Enable the "Show Results" button when the quiz is finished
    const resultsButton = document.getElementById('resultsButton');
    resultsButton.disabled = false; // Enable the button

    
}
