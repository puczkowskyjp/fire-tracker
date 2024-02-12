"use client";

import React from 'react';
import ActionDrawer, { DRAWER_WIDTH } from "@/components/MainPage/ActionDrawer";
import Box from "@mui/material/Box";
import Header from '@/components/Header';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { Unauthenticated, Authenticated } from './Drawer-Content';
import { createClient, } from '@/utils/supabase/client';
import { Session, User } from "@supabase/supabase-js";
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
const ArcMap = dynamic(
  () => import("@/components/MainPage/ArcMap"),
  { ssr: false }
);

interface MainPageProps {
  isSupabaseConnected: boolean;
}

export default function MainPage({ isSupabaseConnected }: MainPageProps) {

  const [open, setOpen] = React.useState(false);
  const [user, setUser] = React.useState<User | undefined>();
  const [session, setSession] = React.useState<Session | null>(null);
  const [authInitialized, setAuthInitialized] = React.useState(false);
  const [openSnack, setOpenSnack] = React.useState(false);
  const supabase = createClient();

  React.useEffect(() => {
    if (authInitialized) return;

    const setData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      console.log(session);
      setSession(session);
      setUser(session?.user);
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('onauthstate', session)
      setSession(session);
      setUser(session?.user);
    });

    setData();
    setAuthInitialized(true);

    return () => {
      listener?.subscription.unsubscribe();
    }
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const showSnackBar = React.useCallback((val: boolean) => {
    console.log('show')
    setOpenSnack(val);
  }, [setOpenSnack]);

  console.log(openSnack)

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Header menuCallback={handleDrawerOpen} open={open} showMenu={true} user={user?.email} />
        <Box sx={{ display: 'flex', width: '100%', flex: 1 }}>
          <MainContent open={open}>
            <ArcMap />
          </MainContent>
          <ActionDrawer open={open} drawerClose={handleDrawerClose}>
            {(isSupabaseConnected && session && user) ? <Authenticated openSnackBar={showSnackBar} /> : <Unauthenticated />}
          </ActionDrawer>
        </Box>
      </Box>
      <Snackbar
        action={
          <Button onClick={() => setOpenSnack(false)} color="inherit" size="small">
            X
          </Button>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={openSnack}
        message="User is logged out!"
        onClose={() => setOpenSnack(false)}
      />
    </>
  )
}

interface MainContentProps extends React.PropsWithChildren {
  open: boolean;
}
function MainContent({ open, children }: MainContentProps) {
  const theme = useTheme();
  return (
    <div
      style={{
        flexGrow: 1,
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        marginRight: -DRAWER_WIDTH,
        ...(open && {
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginRight: 0,
        }),
        position: 'relative',
      }}>
      {children}
    </div>
  );
}
