// Define an interface for a User
interface User {
    id: number;
    name: string;
    email: string;
}

// Define a class that implements the User interface
class UserAccount implements User {
    id: number;
    name: string;
    email: string;

    constructor(id: number, name: string, email: string) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    // Method to display user information
    displayUserInfo(): void {
        console.log(`User Info: ID=${this.id}, Name=${this.name}, Email=${this.email}`);
    }
}

// Function to create a new user
function createUser(id: number, name: string, email: string): User {
    return new UserAccount(id, name, email);
}

// Example usage
const user = createUser(1, "John Doe", "john.doe@example.com");
user.displayUserInfo();