/**
 * Website Requirements Intelligence System - Main Application
 */

import { FormHandler } from './form-handler.js';
import { ValidationSystem } from './validation.js';
import { StorageManager } from './storage.js';

class RequirementsFormApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.formData = {};
        this.completedSteps = new Set();
        
        // Initialize core systems
        this.formHandler = new FormHandler();
        this.validator = new ValidationSystem();
        this.storage = new StorageManager();
        
        // DOM elements
        this.form = document.getElementById('requirementsForm');
        this.progressFill = document.querySelector('.progress-fill');
        this.currentStepEl = document.getElementById('currentStep');
        this.saveStatus = document.getElementById('saveStatus');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Requirements Form App...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update UI
        this.updateUI();
        
        // Setup auto-save
        this.setupAutoSave();
        
        console.log('✅ App initialization complete');
    }

    setupEventListeners() {
        // Navigation buttons
        this.prevBtn?.addEventListener('click', () => this.previousStep());
        this.nextBtn?.addEventListener('click', () => this.nextStep());
        
        // Form field changes
        this.form?.addEventListener('input', (e) => this.handleFieldChange(e));
        this.form?.addEventListener('change', (e) => this.handleFieldChange(e));
        
        // Auto-save on window blur
        window.addEventListener('beforeunload', () => this.saveProgress());
    }

    handleFieldChange(event) {
        const field = event.target;
        if (!field.name) return;
        
        // Update form data
        this.updateFormData(field);
        
        // Real-time validation
        this.validator.validateField(field);
        
        // Update UI enhancements
        this.updateFieldEnhancements(field);
        
        // Auto-save after delay
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => this.saveProgress(), 1000);
    }

    updateFormData(field) {
        if (field.type === 'checkbox') {
            const checkedBoxes = document.querySelectorAll(`[name="${field.name}"]:checked`);
            this.formData[field.name] = Array.from(checkedBoxes).map(cb => cb.value);
        } else {
            this.formData[field.name] = field.value;
        }
    }

    updateFieldEnhancements(field) {
        // Update character count for textareas
        if (field.tagName === 'TEXTAREA') {
            const countEl = document.getElementById(`${field.id}-count`);
            if (countEl) {
                countEl.textContent = field.value.length;
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

    async nextStep() {
        // Validate current step
        if (!this.validateCurrentStep()) {
            this.showError('Please fill in all required fields correctly.');
            return;
        }
        
        // Move to next step or generate results
        if (this.currentStep < this.totalSteps) {
            await this.transitionToStep(this.currentStep + 1);
        } else {
            this.generateResults();
        }
    }

    async previousStep() {
        if (this.currentStep > 1) {
            await this.transitionToStep(this.currentStep - 1);
        }
    }

    async transitionToStep(stepNumber) {
        const currentStepEl = document.getElementById(`step-${this.currentStep}`);
        const nextStepEl = document.getElementById(`step-${stepNumber}`);
        
        if (!currentStepEl || !nextStepEl) return;
        
        // Switch steps
        currentStepEl.classList.remove('active');
        nextStepEl.classList.add('active');
        
        // Update current step
        this.currentStep = stepNumber;
        
        // Update UI
        this.updateUI();
        
        // Save progress
        await this.saveProgress();
    }

    validateCurrentStep() {
        const currentStepEl = document.getElementById(`step-${this.currentStep}`);
        if (!currentStepEl) return true;
        
        const requiredFields = currentStepEl.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validator.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    updateUI() {
        // Update progress bar
        const progress = (this.currentStep / this.totalSteps) * 100;
        if (this.progressFill) {
            this.progressFill.style.width = `${progress}%`;
        }
        
        // Update step number
        if (this.currentStepEl) {
            this.currentStepEl.textContent = this.currentStep;
        }
        
        // Update navigation buttons
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentStep === 1;
        }
        
        if (this.nextBtn) {
            if (this.currentStep === this.totalSteps) {
                this.nextBtn.textContent = 'Generate Results →';
                this.nextBtn.classList.add('btn-success');
            } else {
                this.nextBtn.textContent = 'Continue →';
                this.nextBtn.classList.remove('btn-success');
            }
        }
    }

    setupAutoSave() {
        // Save every 30 seconds
        setInterval(() => this.saveProgress(), 30000);
    }

    async saveProgress() {
        try {
            const progressData = {
                formData: this.formData,
                currentStep: this.currentStep,
                timestamp: Date.now()
            };
            
            await this.storage.saveFormData(progressData);
            this.updateSaveStatus('saved');
            
        } catch (error) {
            console.error('Save failed:', error);
            this.updateSaveStatus('error');
        }
    }

    updateSaveStatus(status) {
        if (!this.saveStatus) return;
        
        switch (status) {
            case 'saved':
                this.saveStatus.innerHTML = '<span class="icon">✅</span> Auto-saved';
                break;
            case 'error':
                this.saveStatus.innerHTML = '<span class="icon">⚠️</span> Save failed';
                break;
        }
    }

    async generateResults() {
        try {
            console.log('🎯 Generating AI prompts...');
            
            const prompts = await this.formHandler.generateAIPrompts(this.formData);
            
            // Save results
            const results = {
                formData: this.formData,
                prompts: prompts,
                timestamp: new Date().toISOString()
            };
            
            await this.storage.saveResults(results);
            
            // Show success message
            this.showSuccess('Results generated successfully! Check your browser console for AI prompts.');
            console.log('Generated AI Prompts:', prompts);
            
        } catch (error) {
            console.error('Error generating results:', error);
            this.showError('Failed to generate results. Please try again.');
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
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
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.requirementsApp = new RequirementsFormApp();
});
