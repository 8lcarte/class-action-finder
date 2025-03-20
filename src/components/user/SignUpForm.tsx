import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

interface SignUpFormProps {
  onSuccess?: () => void;
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const { signUp } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error, user } = await signUp(data.email, data.password, {
        name: data.name,
      });
      
      if (error) {
        setError(error.message);
        return;
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Create an Account</h2>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <Input
          label="Full Name"
          fullWidth
          error={errors.name?.message}
          {...register('name', { 
            required: 'Name is required',
          })}
        />
        
        <Input
          label="Email"
          type="email"
          fullWidth
          error={errors.email?.message}
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />
        
        <Input
          label="Password"
          type="password"
          fullWidth
          error={errors.password?.message}
          {...register('password', { 
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          })}
        />
        
        <Input
          label="Confirm Password"
          type="password"
          fullWidth
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', { 
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match',
          })}
        />
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Privacy Policy
          </a>
        </div>
        
        <Button type="submit" fullWidth isLoading={isLoading}>
          Sign Up
        </Button>
        
        <div className="text-center">
          <span className="text-gray-600 dark:text-gray-400">Already have an account?</span>{' '}
          <a href="/sign-in" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Sign in
          </a>
        </div>
      </form>
    </Card>
  );
}
