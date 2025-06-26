/**
 * Storage Manager - LocalStorage handling
 */

export class StorageManager {
    constructor() {
        this.storageKey = 'websiteRequirementsForm';
        this.resultsKey = 'websiteRequirementsResults';
    }

    async saveFormData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            console.log('📦 Form data saved to localStorage');
        } catch (error) {
            console.error('Failed to save form data:', error);
            throw error;
        }
    }

    async loadFormData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load form data:', error);
            return null;
        }
    }

    async saveResults(results) {
        try {
            const resultsWithId = {
                ...results,
                id: this.generateId()
            };
            
            localStorage.setItem(this.resultsKey, JSON.stringify(resultsWithId));
            console.log('💾 Results saved to localStorage');
            
            return resultsWithId.id;
        } catch (error) {
            console.error('Failed to save results:', error);
            throw error;
        }
    }

    async loadResults() {
        try {
            const data = localStorage.getItem(this.resultsKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load results:', error);
            return null;
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
