import dotenv from 'dotenv';
import app, { connectDB } from './src/app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('===========================================================');
    console.log(' STARTING AI MANUFACTURING COPILOT REST API SERVER');
    console.log('===========================================================');
    
    // Connect to Database (Fail-fast if connection fails)
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server listening on http://localhost:${PORT}`);
      console.log(`✔ Health Check Endpoint: http://localhost:${PORT}/api/health`);
      console.log(`✔ API Root Endpoint:     http://localhost:${PORT}/api`);
      console.log('===========================================================\n');
    });
  } catch (error) {
    console.error('❌ Critical failure starting API server:', error.message);
    process.exit(1);
  }
};

startServer();
