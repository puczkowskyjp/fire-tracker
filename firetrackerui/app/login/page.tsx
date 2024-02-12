import Link from "next/link";
import { headers, cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Header from "@/components/Header";
import Fab from "@mui/material/Fab";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect("/");
  };

  const signUp = async (formData: FormData) => {
    "use server";

    const origin = headers().get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect("/login?message=Check email to continue sign in process");
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Header showMenu={false} />
      <Box
        sx={{
          padding: '16px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          rowGap: 8,
          alignItems: 'center',
          // width: '100%'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            width: '100%',
          }}
        >
          <Fab
            size="small"
            color="primary"
            variant="extended"
            // sx={{
            //   // position: 'absolute',
            //   // left: 8,
            //   // top: 8,
            //   fontSize: '16px',
            //   padding: '2px 4px',
            //   color: '#fff'
            // }} 
            href="/"
          >
            <ChevronLeftIcon sx={{ mr: 1 }} />
            Back
          </Fab>
        </Box>
        <Box
          sx={{
            flex: 1
            // maxWidth: '50vw'
    
          }}
        >
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
              className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2"
            >
              Sign Up
            </button>
            {searchParams?.message && (
              <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
                {searchParams.message}
              </p>
            )}
          </form>
        </Box>
      </Box>
    </Box>
  );
}
