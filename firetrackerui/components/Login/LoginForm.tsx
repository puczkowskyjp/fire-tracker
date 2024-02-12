"use client";
import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { useRouter } from "next/navigation";

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface LoginFormProps {
  signIn: (formData: FormData) => void;
  signUp: (formData: FormData) => void;
  open: boolean;
}
export default function LoginForm({ signIn, signUp, open }: LoginFormProps) {
  const router = useRouter();


  return (
    <Modal open={open} onClose={() => router.push("/")}>
      <Box sx={style}>
        <form
          className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
          action={signIn}
        >
          <label className="text-md" htmlFor="email">
            Email
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
            name="email"
            placeholder="you@example.com"
            required
          />
          <label className="text-md" htmlFor="password">
            Password
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
          <button className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2">
            Sign In
          </button>
          <button
            formAction={signUp}
            className="bg-green-700 border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2"
          >
            Sign Up
          </button>
          {/* {searchParams?.message && (
        <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
          {searchParams.message}
        </p>
      )} */}
        </form>
      </Box>
    </Modal>
  )
}
