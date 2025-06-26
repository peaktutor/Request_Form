/**
 * Working Form Script - No Modules, Direct Implementation
 */

// Global variables
let currentStep = 1;
let totalSteps = 6;
let formData = {};
let autoSaveTimeout;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Form script loaded');
    initializeForm();
});

function initializeForm() {
    console.log('🔧 Initializing form...');
    
    // Get DOM elements
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const form = document.getElementById('requirementsForm');
    const progressFill = document.querySelector('.progress-fill');
    const currentStepEl = document.getElementById('currentStep');
    const saveStatus = document.getElementById('saveStatus');

    // Check if elements exist
    if (!prevBtn || !nextBtn) {
        console.error('❌ Navigation buttons not found');
        return;
    }

    console.log('✅ Found navigation buttons');

    // Add event listeners
    prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('⬅️ Previous button clicked');
        goToPreviousStep();
    });

    nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('➡️ Next button clicked');
        goToNextStep();
    });

    // Add form field listeners
    if (form) {
        form.addEventListener('input', handleFieldChange);
        form.addEventListener('change', handleFieldChange);
        console.log('✅ Form listeners added');
    }

    // Update UI
    updateUI();
    
    // Load saved data
    loadSavedData();

    console.log('✅ Form initialization complete');
}

function goToNextStep() {
    console.log('🎯 Moving to next step from', currentStep);
    
    // Validate current step
    if (!validateCurrentStep()) {
        console.log('❌ Validation failed');
        showNotification('Please fill in all required fields correctly.', 'error');
        return;
    }

    // Move to next step or generate results
    if (currentStep < totalSteps) {
        transitionToStep(currentStep + 1);
    } else {
        generateResults();
    }
}

function goToPreviousStep() {
    console.log('⬅️ Moving to previous step from', currentStep);
    
    if (currentStep > 1) {
        transitionToStep(currentStep - 1);
    }
}

function transitionToStep(stepNumber) {
    console.log(`🔄 Transitioning from step ${currentStep} to step ${stepNumber}`);
    
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    const nextStepEl = document.getElementById(`step-${stepNumber}`);
    
    if (!currentStepEl) {
        console.error(`❌ Current step element not found: step-${currentStep}`);
        return;
    }
    
    if (!nextStepEl) {
        console.error(`❌ Next step element not found: step-${stepNumber}`);
        // For now, just show message if step doesn't exist
        showNotification(`Step ${stepNumber} not implemented yet. This is a 2-step demo.`, 'info');
        return;
    }
    
    // Switch steps
    currentStepEl.classList.remove('active');
    nextStepEl.classList.add('active');
    
    // Update current step
    currentStep = stepNumber;
    
    // Update UI
    updateUI();
    
    // Save progress
    saveProgress();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log(`✅ Successfully moved to step ${stepNumber}`);
}

function validateCurrentStep() {
    console.log(`🔍 Validating step ${currentStep}`);
    
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    if (!currentStepEl) {
        console.log('⚠️ No step element found, skipping validation');
        return true;
    }
    
    const requiredFields = currentStepEl.querySelectorAll('[required]');
    let isValid = true;
    let invalidCount = 0;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
            invalidCount++;
        }
    });
    
    console.log(`📊 Validation result: ${isValid ? 'PASSED' : 'FAILED'} (${invalidCount} invalid fields)`);
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = `${getFieldLabel(field)} is required`;
    }
    
    // Update field appearance
    updateFieldAppearance(field, isValid, errorMessage);
    
    return isValid;
}

function updateFieldAppearance(field, isValid, errorMessage) {
    const errorEl = document.getElementById(`${field.id}-error`);
    
    // Remove previous classes
    field.classList.remove('valid', 'error');
    
    if (isValid) {
        field.classList.add('valid');
        if (errorEl) {
            errorEl.classList.remove('show');
            errorEl.textContent = '';
        }
    } else {
        field.classList.add('error');
        if (errorEl) {
            errorEl.classList.add('show');
            errorEl.textContent = errorMessage;
        }
    }
}

function getFieldLabel(field) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) {
        return label.textContent.replace('*', '').trim();
    }
    return field.name || 'This field';
}

function handleFieldChange(event) {
    const field = event.target;
    if (!field.name) return;
    
    console.log(`📝 Field changed: ${field.name} = ${field.value}`);
    
    // Update form data
    updateFormData(field);
    
    // Real-time validation
    validateField(field);
    
    // Update UI enhancements
    updateFieldEnhancements(field);
    
    // Auto-save after delay
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        saveProgress();
    }, 1000);
}

function updateFormData(field) {
    if (field.type === 'checkbox') {
        const checkedBoxes = document.querySelectorAll(`[name="${field.name}"]:checked`);
        formData[field.name] = Array.from(checkedBoxes).map(cb => cb.value);
    } else if (field.type === 'radio') {
        formData[field.name] = field.value;
    } else {
        formData[field.name] = field.value;
    }
    
    console.log('💾 Form data updated:', field.name, formData[field.name]);
}

function updateFieldEnhancements(field) {
    // Update character count for textareas
    if (field.tagName === 'TEXTAREA') {
        const countEl = document.getElementById(`${field.id}-count`);
        if (countEl) {
            const count = field.value.length;
            countEl.textContent = count;
            
            // Color coding
            countEl.className = 'character-count';
            if (count > 1000) countEl.classList.add('over-limit');
            else if (count > 500) countEl.classList.add('warning');
        }
    }
    
    // Update slider value display
    if (field.type === 'range' && field.id === 'yearsInBusiness') {
        const valueEl = document.getElementById('yearsValue');
        if (valueEl) {
            const value = parseInt(field.value);
            valueEl.textContent = value === 0 ? 'New' : 
                                value === 50 ? '50+ years' : 
                                `${value} years`;
        }
    }
}

function updateUI() {
    console.log('🎨 Updating UI for step', currentStep);
    
    // Update progress bar
    const progress = (currentStep / totalSteps) * 100;
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    // Update step number
    const currentStepEl = document.getElementById('currentStep');
    if (currentStepEl) {
        currentStepEl.textContent = currentStep;
    }
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentStep === 1;
    }
    
    if (nextBtn) {
        if (currentStep === totalSteps) {
            nextBtn.textContent = 'Generate Results →';
            nextBtn.classList.add('btn-success');
        } else if (currentStep === 2) {
            // Since we only have 2 steps implemented
            nextBtn.textContent = 'Generate Results →';
            nextBtn.classList.add('btn-success');
        } else {
            nextBtn.textContent = 'Continue →';
            nextBtn.classList.remove('btn-success');
        }
    }
}

function saveProgress() {
    try {
        const progressData = {
            formData: formData,
            currentStep: currentStep,
            timestamp: Date.now()
        };
        
        localStorage.setItem('websiteRequirementsForm', JSON.stringify(progressData));
        updateSaveStatus('saved');
        console.log('💾 Progress saved');
        
    } catch (error) {
        console.error('❌ Save failed:', error);
        updateSaveStatus('error');
    }
}

function loadSavedData() {
    try {
        const saved = localStorage.getItem('websiteRequirementsForm');
        if (saved) {
            const data = JSON.parse(saved);
            formData = data.formData || {};
            currentStep = data.currentStep || 1;
            
            // Populate form fields
            Object.entries(formData).forEach(([fieldName, value]) => {
                const field = document.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    if (field.type === 'checkbox' || field.type === 'radio') {
                        if (Array.isArray(value)) {
                            value.forEach(val => {
                                const specificField = document.querySelector(`[name="${fieldName}"][value="${val}"]`);
                                if (specificField) specificField.checked = true;
                            });
                        } else {
                            const specificField = document.querySelector(`[name="${fieldName}"][value="${value}"]`);
                            if (specificField) specificField.checked = true;
                        }
                    } else {
                        field.value = value;
                    }
                }
            });
            
            // Show the correct step
            transitionToStep(currentStep);
            
            console.log('📦 Loaded saved data:', Object.keys(formData).length, 'fields');
        }
    } catch (error) {
        console.error('❌ Failed to load saved data:', error);
    }
}

function updateSaveStatus(status) {
    const saveStatus = document.getElementById('saveStatus');
    if (!saveStatus) return;
    
    switch (status) {
        case 'saved':
            saveStatus.innerHTML = '<span class="icon">✅</span> Auto-saved';
            saveStatus.className = 'save-status';
            break;
        case 'error':
            saveStatus.innerHTML = '<span class="icon">⚠️</span> Save failed';
            saveStatus.className = 'save-status error';
            break;
    }
}

function generateResults() {
    console.log('🎯 Generating results...');
    
    // Simple prompt generation for testing
    const prompts = {
        business: generateBusinessPrompt(),
        audience: generateAudiencePrompt(),
        timestamp: new Date().toISOString()
    };
    
    console.log('🤖 Generated AI Prompts:', prompts);
    
    // Save results
    try {
        localStorage.setItem('websiteRequirementsResults', JSON.stringify({
            formData: formData,
            prompts: prompts,
            timestamp: new Date().toISOString()
        }));
    } catch (error) {
        console.error('❌ Failed to save results:', error);
    }
    
    showNotification('Results generated successfully! Check browser console for AI prompts.', 'success');
}

function generateBusinessPrompt() {
    return `
🏢 BUSINESS STRATEGY ANALYSIS for ${formData.companyName || '[Company]'}

Industry: ${formData.industry || '[Not specified]'}
Business Size: ${formData.businessSize || '[Not specified]'}
Primary Goal: ${formData.primaryGoal || '[Not specified]'}
Years in Business: ${formData.yearsInBusiness || '5'}

Business Context:
${formData.businessStory || '[Business story not provided]'}

Competitive Intelligence:
${formData.competitiveIntelligence || '[Competitive analysis not provided]'}

Business Model:
${formData.businessModel || '[Business model not provided]'}

RESEARCH TASKS:
1. Analyze ${formData.industry || 'industry'} market trends and opportunities
2. Develop competitive positioning strategy
3. Create scalable business model recommendations
4. Design growth strategy aligned with ${formData.primaryGoal || 'primary goal'}

DELIVERABLES:
- Market opportunity analysis
- Competitive advantage framework
- Revenue optimization strategy
- 3-year growth roadmap
    `;
}

function generateAudiencePrompt() {
    const customerAge = Array.isArray(formData.customerAge) ? formData.customerAge.join(', ') : (formData.customerAge || '[Not specified]');
    const contactPreference = Array.isArray(formData.contactPreference) ? formData.contactPreference.join(', ') : (formData.contactPreference || '[Not specified]');
    
    return `
👥 USER EXPERIENCE & AUDIENCE STRATEGY

Target Demographics: ${customerAge}
Tech Comfort Level: ${formData.techSavviness || '[Not specified]'}
Contact Preferences: ${contactPreference}

Customer Profiles:
${formData.customerProfiles || '[Customer profiles not provided]'}

Pain Points:
${formData.customerPainPoints || '[Pain points not provided]'}

Customer Journey:
${formData.customerJourney || '[Customer journey not provided]'}

RESEARCH TASKS:
1. Create detailed user personas with psychological profiles
2. Map complete customer journey with touchpoints
3. Design conversion optimization strategy
4. Develop accessibility and usability framework

DELIVERABLES:
- User persona development
- Journey mapping and optimization
- UX strategy and wireframes
- Conversion rate optimization plan
    `;
}

function showNotification(message, type = 'info') {
    console.log(`📢 Notification (${type}):`, message);
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Debug helper
console.log('📝 Form script loaded successfully');
