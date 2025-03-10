import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const Register = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .required('First name is required')
      .min(2, 'First name must be at least 2 characters'),
    lastName: Yup.string()
      .required('Last name is required')
      .min(2, 'Last name must be at least 2 characters'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
    companyName: Yup.string()
      .required('Company name is required'),
    agreeToTerms: Yup.boolean()
      .oneOf([true], 'You must accept the terms and conditions')
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to register user
      console.log('Form values:', values);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <i className="fas fa-robot text-blue-600 text-4xl"></i>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Start Your Free Trial
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          14 days free trial, no credit card required.{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Already have an account?
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              confirmPassword: '',
              companyName: '',
              agreeToTerms: false
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="form-label">
                      First Name
                    </label>
                    <Field
                      type="text"
                      name="firstName"
                      className="form-input"
                      placeholder="John"
                    />
                    {errors.firstName && touched.firstName && (
                      <div className="form-error">{errors.firstName}</div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="form-label">
                      Last Name
                    </label>
                    <Field
                      type="text"
                      name="lastName"
                      className="form-input"
                      placeholder="Doe"
                    />
                    {errors.lastName && touched.lastName && (
                      <div className="form-error">{errors.lastName}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <Field
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="john@company.com"
                  />
                  {errors.email && touched.email && (
                    <div className="form-error">{errors.email}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="companyName" className="form-label">
                    Company Name
                  </label>
                  <Field
                    type="text"
                    name="companyName"
                    className="form-input"
                    placeholder="Your Company"
                  />
                  {errors.companyName && touched.companyName && (
                    <div className="form-error">{errors.companyName}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <Field
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
                  />
                  {errors.password && touched.password && (
                    <div className="form-error">{errors.password}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <div className="form-error">{errors.confirmPassword}</div>
                  )}
                </div>

                <div className="flex items-center">
                  <Field
                    type="checkbox"
                    name="agreeToTerms"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                      Terms and Conditions
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && touched.agreeToTerms && (
                  <div className="form-error">{errors.agreeToTerms}</div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Creating your account...
                      </>
                    ) : (
                      'Start Free Trial'
                    )}
                  </button>
                </div>

                {errors.submit && (
                  <div className="form-error text-center">{errors.submit}</div>
                )}
              </Form>
            )}
          </Formik>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <i className="fab fa-google text-red-600 mr-2"></i>
                Google
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <i className="fab fa-microsoft text-blue-600 mr-2"></i>
                Microsoft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
