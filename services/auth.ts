import { User, UserRole } from '../types';

// Mock database
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Ananya Sharma',
    email: 'user@vastra.ai',
    role: 'user',
    avatar: 'https://ui-avatars.com/api/?name=Ananya+Sharma&background=db2777&color=fff',
    phone: '9876543210',
    countryCode: '+91'
  },
  {
    id: '2',
    name: 'Vastra Admin',
    email: 'flyingpopat@gmail.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Vastra+Admin&background=0f172a&color=fff'
  }
];

export const login = async (email: string, password: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simple mock validation
  if (email === 'flyingpopat@gmail.com' && password === 'flyingpopat') {
    return MOCK_USERS[1];
  }
  
  if (email === 'user@vastra.ai' && password === 'user') {
    return MOCK_USERS[0];
  }

  // Allow any other login as a generic user for demo purposes if it's not the admin email
  if (email !== 'flyingpopat@gmail.com' && password.length > 3) {
     return {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email: email,
        role: 'user',
        avatar: `https://ui-avatars.com/api/?name=${email}&background=random`
     };
  }

  throw new Error('Invalid credentials');
};

export const register = async (name: string, email: string, password: string, phone: string, countryCode: string, role: UserRole = 'user'): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (!email || !password || !name || !phone) {
    throw new Error('All fields are required');
  }

  return {
    id: Date.now().toString(),
    name,
    email,
    role,
    phone,
    countryCode,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
  };
};

export const logout = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
};