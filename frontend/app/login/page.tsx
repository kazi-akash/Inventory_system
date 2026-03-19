'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/utils/validators';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/utils/constants';
import Link from 'next/link';
import { LogIn, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirect = searchParams.get('redirect') || ROUTES.PRODUCTS;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
      showToast('Welcome back!', 'success');
      router.push(redirect);
    } catch (error: any) {
      showToast(
        error.response?.data?.detail || 'Invalid email or password',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href={ROUTES.REGISTER} className="font-medium text-blue-600 hover:text-blue-500">
              Create one now
            </Link>
          </p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <div>
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full"
              >
                Sign in
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Test Accounts</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">Regular User:</p>
                  <p className="text-gray-600">user@example.com / user123</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">Admin User:</p>
                  <p className="text-gray-600">admin@example.com / admin123</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {redirect !== ROUTES.PRODUCTS && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              After login, you'll be redirected back to continue
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
