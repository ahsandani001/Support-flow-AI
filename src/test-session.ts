// THIS IS JUST TO VERIFY EVERYTHING WORKS
import { redisClient, connectRedis } from './config/redis.ts';
import {
  setSessionData,
  getSessionData,
  deleteSessionData,
} from './utils/session.utils.ts';

async function testSessions() {
  try {
    // Connect Redis first
    await connectRedis();

    // 1. Store a test session
    console.log('📝 Storing test session...');
    await setSessionData('test-123', {
      userId: 'user-456',
      name: 'Ahsan',
      role: 'admin',
    });

    // 2. Retrieve it
    console.log('🔍 Retrieving session...');
    const session = await getSessionData('test-123');
    console.log('Retrieved:', session);

    // 3. Delete it
    console.log('🗑️ Deleting session...');
    await deleteSessionData('test-123');

    // 4. Verify deletion
    const deleted = await getSessionData('test-123');
    console.log('After deletion:', deleted); // Should be null

    console.log('✅ Session utilities working!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await redisClient.quit();
  }
}

testSessions();
