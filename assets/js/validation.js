/**
 * Validation System
 */

export class ValidationSystem {
    constructor() {
        this.validationRules = {
            companyName: { required: true, minLength: 2 },
            industry: { required: true },
            businessSize: { required: true },
            primaryGoal: { required: true }
        };
    }

    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = this.validationRules[fieldName] || {};
        
        let isValid = true;
        let errorMessage = '';

        // Check required
        if (rules.required && !value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(fieldName)} is required`;
        }

        // Check minimum length
        if (rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(fieldName)} must be at least ${rules.minLength} characters`;
        }

        // Update field appearance
        this.updateFieldAppearance(field, isValid, errorMessage);

        return isValid;
    }

    updateFieldAppearance(field, isValid, errorMessage) {
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

    getFieldLabel(fieldName) {
        const labelMap = {
            companyName: 'Company Name',
            industry: 'Industry',
            businessSize: 'Business Size',
            primaryGoal: 'Primary Website Goal'
        };
        
        return labelMap[fieldName] || fieldName;
    }
}
