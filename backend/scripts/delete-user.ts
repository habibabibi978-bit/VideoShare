import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';

async function deleteUserByEmail() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  
  const email = 'habibabibi978@gmail.com';
  
  console.log(`\n🔍 Searching for user with email: ${email}...\n`);
  
  const result = await usersService.deleteUserByEmail(email);
  
  if (result.success) {
    console.log(`✅ ${result.message}\n`);
  } else {
    console.log(`❌ ${result.message}\n`);
  }
  
  await app.close();
  process.exit(result.success ? 0 : 1);
}

deleteUserByEmail().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

