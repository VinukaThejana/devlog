import { Dispatch, SetStateAction, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Assign, ObjectShape } from 'yup/lib/object';
import { RequiredStringSchema } from 'yup/lib/string';
import { AnyObject } from 'yup/lib/types';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from 'config/firebase';
import { FirebaseError } from 'firebase-admin';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid';
import { ResetPassword } from './password-reset';
import { useData } from 'hooks/user-data';
import { doc, writeBatch } from 'firebase/firestore';
import { authEncoded } from '@lib/session';

export const Email = (props: {
  register: boolean;
  setHideProviders: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  const { setHideProviders, setLoading } = props;
  const { mutate } = useData();

  const [resetPassword, setResetPassword] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisibility] = useState<boolean>(false);
  const router = useRouter();

  // Generate the login or register form depending on the
  // passed props
  let formSchema: unknown;
  if (props.register) {
    formSchema = yup.object().shape({
      email: yup
        .string()
        .required('Enter an email address')
        .email('Must be a valid email address')
        .max(255, 'The email should not be greater than 255 characters'),
      password: yup
        .string()
        .required('Password is required')
        .min(8, 'The password should be greater than 8 characters')
        .matches(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
          'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character'
        ),
      passwordConfirm: yup
        .string()
        .required('Confirm password is required')
        .oneOf([yup.ref('password')], 'Passwords should match'),
    });
  } else {
    formSchema = yup.object().shape({
      email: yup
        .string()
        .required('Enter an email address')
        .email('Must be a valid email address')
        .max(255, 'The email should not be greater than 255 characters'),
      password: yup.string().required('Password is required'),
      passwordConfirm: yup
        .string()
        .oneOf([yup.ref('password')], 'Passwords should match'),
    });
  }

  // Generate the type depending on the formSchema which
  // ultimately depends on the passed props
  type schemaTypeWhenRegister = yup.ObjectSchema<
    Assign<
      ObjectShape,
      {
        email: RequiredStringSchema<string | undefined, AnyObject>;
        password: RequiredStringSchema<string | undefined, AnyObject>;
        passwordConfirm: RequiredStringSchema<string | undefined, AnyObject>;
      }
    >
  >;

  type schemaTypeWhenLogin = yup.ObjectSchema<
    Assign<
      ObjectShape,
      {
        email: RequiredStringSchema<string | undefined, AnyObject>;
        password: RequiredStringSchema<string | undefined, AnyObject>;
        passwordConfrm: yup.StringSchema;
      }
    >
  >;

  type schemaType = typeof formSchema extends schemaTypeWhenRegister
    ? schemaTypeWhenRegister
    : schemaTypeWhenLogin;

  interface IFormInputs {
    email: string;
    password: string;
    passwordConfirm: string;
  }

  const { register, handleSubmit, formState } = useForm<IFormInputs>({
    resolver: yupResolver(formSchema as schemaType),
  });
  const { errors } = formState;

  // Handle the formSubmit event
  const onFormSubmit = (data: IFormInputs) => {
    setLoading(true);
    const { email, password } = data;

    if (email && password) {
      if (props.register) {
        // Create the user with the email and password
        createUserWithEmailAndPassword(auth(), email, password)
          .then(async (result) => {
            // Email verification
            sendEmailVerification(result.user);
            toast.success('Please verify your email address');

            const { uid } = result.user;
            // eslint-disable-next-line
            const name = email.match(/^.+(?=@)/)![0];

            // Generate a new displayName
            const displayName = name
              .replaceAll('.', ' ')
              .replaceAll('-', ' ')
              .replaceAll('_', ' ');
            const username =
              name.toLowerCase().replaceAll('.', '-').replaceAll('_', '-') +
              new Date().getMilliseconds().toString();
            const profilePicture = `https://avatars.dicebear.com/api/adventurer/${uid}.svg`;

            const userRef = doc(db(), 'users', uid);
            const usernameRef = doc(db(), 'usernames', username);

            console.log(username, uid, email, displayName, profilePicture);

            const batch = writeBatch(db());

            batch.set(usernameRef, {
              uid,
            });
            batch.set(userRef, {
              uid,
              email,
              photoURL: profilePicture,
              displayName,
              username,
            });

            await batch.commit();

            console.log('Updated the database');

            // Update the user profile
            await updateProfile(result.user, {
              displayName: displayName,
              photoURL: profilePicture,
            });

            console.log('Updatedt the profile');

            const idToken = await result.user.getIdToken();

            console.log(idToken, 'user id token');
            await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                Authorization: `Basic ${authEncoded}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ idToken, username }),
            });

            console.log('id token sent');

            mutate();
            router.push('/');
          })
          .catch((error: FirebaseError) => {
            setLoading(false);
            if (error.code === 'auth/email-already-in-use') {
              toast.error(
                'Email is already in use login or use another email address'
              );
            } else {
              console.error(error);
            }
          });
      } else {
        // The user is an exsisting user log him in
        signInWithEmailAndPassword(auth(), email, password)
          .then(async (result) => {
            const idToken = await result.user.getIdToken();
            await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                Authorization: `Basic ${authEncoded}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ idToken }),
            });

            mutate();
            router.push('/');
          })
          .catch((error: FirebaseError) => {
            setLoading(false);
            if (error.code === 'auth/wrong-password') {
              toast.error('Wrong password !!!');
            } else if (error.code === 'auth/user-not-found') {
              toast.error(
                'You have not registered!!! Use a registered account or login'
              );
            } else {
              console.error(error);
            }
          });
      }
    }
  };

  // Toggle the input feild of the form
  // Change the input feild of the form from text to password
  const PasswordVisibility = () => {
    return passwordVisible ? (
      <EyeOffIcon
        type="button"
        className="w-8 h-8 text-slate-600"
        onClick={() => setPasswordVisibility(false)}
      />
    ) : (
      <EyeIcon
        type="button"
        className="w-8 h-8 text-slate-600"
        onClick={() => setPasswordVisibility(true)}
      />
    );
  };

  return props.register ? (
    /* Render the register form */
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-4xl mb-16 -mt-24">Register</h2>

      <form
        className="flex flex-col items-center justify-center gap-2"
        onSubmit={handleSubmit(onFormSubmit)}
      >
        <label className="font-bold text-xl">Email</label>
        <input
          type="email"
          {...register('email')}
          className={`p-2 w-64 text-black border mb-2 ${
            errors.email ? 'border-red-600' : 'border-white'
          }`}
        />
        {errors.email && (
          <p className="text-lg font-bold text-red-600">
            {errors.email?.message}
          </p>
        )}
        <label className="font-bold text-xl mt-3">Password</label>
        <div className="relative">
          <input
            type={`${passwordVisible ? 'text' : 'password'}`}
            {...register('password')}
            className={`p-2 w-64 text-black border mb-2 ${
              errors.password ? 'border-red-600' : 'border-white'
            }`}
          />
          <div className="absolute inset-y-0 right-0 pr-1 pb-2 flex items-center text-sm leading-5">
            <PasswordVisibility />
          </div>
        </div>
        {errors.password && (
          <p className="text-lg font-bold text-red-600">
            {errors.password?.message}
          </p>
        )}

        <label className="font-bold text-xl">Confirm password</label>
        <input
          type={`${passwordVisible ? 'text' : 'password'}`}
          {...register('passwordConfirm')}
          className={`p-2 w-64 text-black border mb-2 ${
            errors.password ? 'border-red-600' : 'border-white'
          }`}
        />
        {errors.passwordConfirm && (
          <p className="text-lg font-bold text-red-600">
            {errors.passwordConfirm?.message}
          </p>
        )}

        <button
          className="px-6 py-2 bg-blue-500 hover:bg-blue-200 rounded border border-blue-400 mt-4"
          type="submit"
        >
          Register
        </button>
      </form>
    </div>
  ) : (
    /* Render the register form */
    <div className="flex flex-col items-center justify-center">
      {!resetPassword ? (
        <>
          <h2 className="text-4xl mb-16 -mt-24">Login</h2>

          <form
            className="flex flex-col items-center justify-center gap-2"
            onSubmit={handleSubmit(onFormSubmit)}
          >
            <label className="font-bold text-xl">Email</label>
            <input
              type="email"
              {...register('email')}
              className={`p-2 w-64 text-black border mb-2 ${
                errors.email ? 'border-red-600' : 'border-white'
              }`}
            />
            {errors.email && (
              <p className="text-lg font-bold text-red-600">
                {errors.email?.message}
              </p>
            )}
            <label className="font-bold text-xl mt-3">Password</label>
            <div className="relative">
              <input
                type={`${passwordVisible ? 'text' : 'password'}`}
                {...register('password')}
                className={`p-2 w-64 text-black border mb-2 ${
                  errors.password ? 'border-red-600' : 'border-white'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-1 pb-2 flex items-center text-sm leading-5">
                <PasswordVisibility />
              </div>
            </div>
            {errors.password && (
              <p className="text-lg font-bold text-red-600">
                {errors.password?.message}
              </p>
            )}
            <button
              className="px-6 py-2 bg-blue-500 hover:bg-blue-200 rounded border border-blue-400 mt-4"
              type="submit"
            >
              Login
            </button>
          </form>

          <button
            className="border-none text-lg underline mt-2"
            onClick={() => {
              setResetPassword(true);
              setHideProviders(true);
            }}
          >
            Reset the password
          </button>
        </>
      ) : (
        <ResetPassword />
      )}
    </div>
  );
};
