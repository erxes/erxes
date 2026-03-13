const path = require('path');

async function startServer() {
    try {
        // Server startup logic here
        console.log('Server is starting...');
        // Example MongoDB connection
        await connectToDatabase();
        console.log('Connected to database.');

        // Start your server here
        const server = app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });

        // Graceful shutdown handlers
        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
                // Close MongoDB connection or other resources
                closeDatabaseConnection();
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
                // Close MongoDB connection or other resources
                closeDatabaseConnection();
            });
        });

        // Exception handlers
        process.on('uncaughtException', (err) => {
            console.error('Uncaught exception:', err);
            // Handle exception and cleanup
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            // Handle unhandled promise rejection
        });

    } catch (error) {
        console.error('Error during server initialization:', error);
        // Handle the error appropriately
    }
}

startServer();
