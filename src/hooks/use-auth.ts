// This file is a convention if we want to re-export.
// However, auth-context.tsx already exports useAuth.
// For simplicity and to avoid potential circular dependencies if other hooks are added here later,
// we can directly import useAuth from '@/contexts/auth-context'.
// This file can be removed or used as a central point for auth-related hooks if it grows.

// For now, to satisfy the plan and keep it simple:
export { useAuth } from '@/contexts/auth-context';
