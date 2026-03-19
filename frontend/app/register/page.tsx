'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/utils/validators';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/utils/constants';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const redirect = searchParams.get('redirect') || ROUTES.PRODUCTS;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password', '');

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      showToast('Account created successfully! Welcome!', 'success');
      router.push(redirect);
    } catch (error: any) {
      showToast(
        error.response?.data?.detail || 'Registration failed. Please try again.',
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
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us to start reserving products
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href={ROUTES.LOGIN} className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Full Name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                error={errors.full_name?.message}
                {...register('full_name')}
              />

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
                    autoComplete="new-password"
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

                {password && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Password requirements:</p>
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {req.met ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full"
              >
                Create account
              </Button>
            </form>
          </CardBody>
        </Card>

        {redirect !== ROUTES.PRODUCTS && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              After registration, you'll be redirected back to continue
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
