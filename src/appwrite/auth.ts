import { Client, Account, ID } from "appwrite";

export class AuthService {
    client: Client; // Fixed: Added proper type annotation
    account: Account; // Fixed: Added proper type annotation

    constructor() {
        this.client = new Client() // Fixed: Added 'new' keyword
            .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // Your API Endpoint
            .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // Your project ID
        
        this.account = new Account(this.client);
    }

    // Create a new user account
    async createAccount(email: string, password: string, name: string) {
        try {
            return await this.account.create(ID.unique(), email, password, name);
        } catch (error) {
            console.error('Error creating account:', error);
            throw error;
        }
    }

    // Login user
    async login(email: string, password: string) {
        try {
            return await this.account.createEmailSession(email, password);
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    }

    // Get current user
    async getCurrentUser() {
        try {
            return await this.account.get();
        } catch (error) {
            console.error('Error getting current user:', error);
            throw error;
        }
    }

    // Logout user
    async logout() {
        try {
            return await this.account.deleteSessions();
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    }

    // Check if user is logged in
    async isLoggedIn(): Promise<boolean> {
        try {
            await this.getCurrentUser();
            return true;
        } catch (error) {
            return false;
        }
    }

    // Delete all sessions (logout from all devices)
    async logoutFromAllDevices() {
        try {
            return await this.account.deleteSessions();
        } catch (error) {
            console.error('Error logging out from all devices:', error);
            throw error;
        }
    }

    // Update user name
    async updateName(name: string) {
        try {
            return await this.account.updateName(name);
        } catch (error) {
            console.error('Error updating name:', error);
            throw error;
        }
    }

    // Update user password
    async updatePassword(newPassword: string, oldPassword: string) {
        try {
            return await this.account.updatePassword(newPassword, oldPassword);
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }

    // Send password recovery email
    async sendPasswordRecovery(email: string) {
        try {
            return await this.account.createRecovery(
                email,
                `${window.location.origin}/reset-password`
            );
        } catch (error) {
            console.error('Error sending password recovery:', error);
            throw error;
        }
    }

    // Complete password recovery
    async completePasswordRecovery(userId: string, secret: string, newPassword: string) {
        try {
            return await this.account.updateRecovery(userId, secret, newPassword, newPassword);
        } catch (error) {
            console.error('Error completing password recovery:', error);
            throw error;
        }
    }

    // Send email verification
    async sendEmailVerification() {
        try {
            return await this.account.createVerification(`${window.location.origin}/verify-email`);
        } catch (error) {
            console.error('Error sending email verification:', error);
            throw error;
        }
    }

    // Complete email verification
    async completeEmailVerification(userId: string, secret: string) {
        try {
            return await this.account.updateVerification(userId, secret);
        } catch (error) {
            console.error('Error completing email verification:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;