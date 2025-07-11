// Complaint Compass - script.js

document.addEventListener('DOMContentLoaded', () => {
    const complaintForm = document.getElementById('complaint-form');
    const analyzeButton = document.getElementById('analyze-button');
    const buttonText = document.querySelector('.button-text');
    const spinner = document.querySelector('.spinner');
    const complaintInput = document.getElementById('complaint-input');
    
    const resultsContainer = document.getElementById('results-container');
    const churnOutput = document.getElementById('churn-output');
    const replyOutput = document.getElementById('reply-output');

    const errorContainer = document.getElementById('error-container');
    const errorOutput = document.getElementById('error-output');

    complaintForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const complaintText = complaintInput.value.trim();
        if (!complaintText) {
            alert('Please enter a complaint to analyze.');
            return;
        }

        // --- Start Loading State ---
        analyzeButton.disabled = true;
        buttonText.textContent = 'Analyzing...';
        spinner.style.display = 'block';
        resultsContainer.style.display = 'none';
        errorContainer.style.display = 'none';

        try {
            const response = await fetch('/api/deconstructor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ complaint: complaintText }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // --- Populate Results ---
            churnOutput.textContent = `Score: ${data.churnMeter.score}/10\n\nReasoning: ${data.churnMeter.reasoning}`;
            replyOutput.textContent = data.suggestedReply;
            resultsContainer.style.display = 'flex';

        } catch (error) {
            console.error('Analysis failed:', error);
            errorOutput.textContent = `An error occurred during analysis. Please try again later. Details: ${error.message}`;
            errorContainer.style.display = 'block';
        } finally {
            // --- End Loading State ---
            analyzeButton.disabled = false;
            buttonText.textContent = 'Analyze Complaint';
            spinner.style.display = 'none';
        }
    });
});