import { yupResolver } from '@hookform/resolvers/yup';
import { auth } from 'config/firebase';
import { FirebaseError } from 'firebase-admin';
import { sendPasswordResetEmail } from 'firebase/auth';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as yup from 'yup';

export const ResetPassword = () => {
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [mail, setMail] = useState<string>('');

  const formSchema = yup.object().shape({
    email: yup.string().email().required(),
  });

  interface IForm {
    email: string;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IForm>({
    resolver: yupResolver(formSchema),
  });

  const onSubmit = (data: IForm) => {
    const { email } = data;
    if (email) {
      setMail(email);
      sendPasswordResetEmail(auth(), email)
        .then(() => {
          setEmailSent(true);
          reset();
        })
        .catch((error: FirebaseError) => {
          if (error.code === 'auth/user-not-found') {
            toast.error('You have not signed up with this email address');
          } else {
            toast.error('Something went wrong please try again');
            console.error(error);
          }
        });
    }
  };

  return !emailSent ? (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-2"
    >
      <label className="text-3xl text-center font-bold mb-8">
        Reset the password
      </label>
      <label className="text-lg text-center font-bold">Email</label>
      <input
        placeholder="user@example.com"
        {...register('email')}
        type="email"
        required
        className={`px-4 py-2 text-black rounded-lg ${
          errors.email?.message ? 'focus:border-red-600' : 'focus:border-black'
        }`}
      />
      {errors.email && (
        <p className="text-lg font-bold text-red-600">
          {errors.email?.message}
        </p>
      )}
      <button
        className="px-4 py-2 bg-blue-800 hover:bg-blue-600 rounded-lg mt-4"
        type="submit"
      >
        Reset the password
      </button>
    </form>
  ) : (
    <div className="flex flex-col items-center justify-center pb-16 gap-2">
      <Image
        src={'https://media.giphy.com/media/cx1SVu2ehrkygaIMlk/giphy.gif'}
        alt={'email'}
        width={200}
        height={200}
      />
      <h1 className="text-3xl text-center mt-8">
        Check your mail for instructions
      </h1>
      <a href={`mailto: ${mail}`} target="blank" className="underline">
        {mail}
      </a>
    </div>
  );
};
