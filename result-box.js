                 // Retrieve quiz results from localStorage 
                const scoreSummary = JSON.parse(localStorage.getItem('scoreSummary'));
                const results = scoreSummary.detailedResults;
                const questions = JSON.parse(localStorage.getItem('currentQuestions'));
                const totalScore = scoreSummary.score || 0; // Default to 0 if no score found

                // Loop through 5 questions, even if some are missing from the results array
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    const question = questions[i];
                    const questionContainer = document.createElement('div');
                    questionContainer.classList.add('question-result');

                    // Question text placeholder
                    const questionText = document.createElement('div');
                    questionText.classList.add('question-text');

                    // Check if the result exists and whether it was answered correctly
                    questionText.textContent = `${i + 1}. ${result.questionText}`;

                    // Display correct answer with dark green background
                    const correctAnswer = document.createElement('div');
                    correctAnswer.classList.add('correct-answer');
                    correctAnswer.textContent = `Correct Answer: ${result.correctAnswer}`;
                    correctAnswer.style.backgroundColor = '#006400';  // Dark Green
                    correctAnswer.style.color = 'white';  // White text for contrast
                    correctAnswer.style.padding = '5px';
                    correctAnswer.style.borderRadius = '5px';
                    correctAnswer.style.borderRadius = '5px';
                    questionContainer.appendChild(correctAnswer);

                    // create element to store the user's answer
                    const yourAnswer = document.createElement('div');
                    yourAnswer.classList.add('yourAnswer');


                    if (result.selectedAnswer !== null) {
                            yourAnswer.textContent ='Your Answer: ' + result.selectedAnswer.map(index => question.options[index]).join(', ');
                    } 

                    else {
                        yourAnswer.textContent = 'Your Answer: No answer provided';
                    }

                    questionContainer.appendChild(yourAnswer);
                    questionContainer.insertBefore(questionText, questionContainer.firstChild);
                    document.querySelector('.score-result').appendChild(questionContainer);
                }

                // Display total score out of 5
                const scoreDisplay = document.querySelector('.score-summary');
                scoreDisplay.textContent = `You got ${totalScore} out of ${results.length} questions correct.`;

                // Display end message based on user's score
                const endMessage = document.querySelector('.end-message');

                if (totalScore < scoreSummary.totalQuestions) {
                endMessage.textContent = "Great effort! Try again to beat your score and aim to finish faster!";
                } 
                
                else {
                // If all questions are correct, show positive message
                endMessage.textContent = "Excellent! You've got all the questions correct! Keep up the great work!";
                }

