"use client";

import React, { Ref, forwardRef, useRef, useState, Suspense, useCallback, useEffect } from 'react';
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
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import POITable, { POITableRef } from '../POITable';
import { WebMapRef, WebMapProps } from '@/components/MainPage/ArcMap';
import CircularProgress from '@mui/material/CircularProgress';
const ArcMap = dynamic(
  () => import("@/components/MainPage/MapWrapper"),
  { ssr: false }
);

interface MainPageProps {
  isSupabaseConnected: boolean;
}

const queryClient = new QueryClient();

export default function MainPage({ isSupabaseConnected }: MainPageProps) {

  const [open, setOpen] = React.useState(false);
  const [user, setUser] = React.useState<User | undefined>();
  const [session, setSession] = React.useState<Session | null>(null);
  const [authInitialized, setAuthInitialized] = React.useState(false);
  const [openSnack, setOpenSnack] = React.useState(false);
  const [locateMe, setLocateMe] = React.useState<Array<string>>([]);
  const arcMapRef: React.MutableRefObject<WebMapRef | null> = useRef<WebMapRef | null>(null);
  const supabase = createClient();
  const [mapReady, setMapReady] = useState(false);
  const poiTableRef = useRef<POITableRef>(null);

  const createAccount = useCallback(async () => {
    await supabase
      .from('account')
      .insert([
        { user_id: session?.user.id },
      ]);
  }, [supabase, session?.user.id]);

  const setData = useCallback(async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session) {

        let { data: Account, error: AccountError } = await supabase
          .from('account')
          .select();

        if (Account && Account?.length === 0) {
          createAccount();
        } else if (Account) {

          const coords: string | null = (Account[0] as Account).user_location;
          if (coords) {
            const json = JSON.parse(coords);
            setLocateMe(json);
          }
        }
      }

      setSession(session);
      setUser(session?.user);
  }, [createAccount, supabase]);

  useEffect(() => {

    if (authInitialized) return;
    setData();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user);
    });

    setData();
    setAuthInitialized(true);

    return () => {
      listener?.subscription.unsubscribe();
    }
  }, [authInitialized, supabase, setData]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const showSnackBar = React.useCallback((val: boolean) => {
    setOpenSnack(val);
  }, [setOpenSnack]);

  const handleLocateMe = (location: string[] | undefined) => {
    if (arcMapRef.current) {
      arcMapRef.current.locateMe(location);
    }
  }

  const hanleOpenLocationTable = () => {
    if (poiTableRef.current) poiTableRef.current.handleOpen();
  }

  const handleApplyLocation = (json: string[]) => {
    if (arcMapRef.current) {
      arcMapRef.current.createGraphic(json);
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Box sx={{ width: '100%' }}>
        <Header menuCallback={handleDrawerOpen} open={open} showMenu={true} user={user?.email} />
        <Box sx={{ display: 'flex', width: '100%', flex: 1 }}>
          <MainContent open={open}>
            <ArcMap setMapReady={setMapReady} locateMe={locateMe} forwardedRef={arcMapRef} />
          </MainContent>
          <ActionDrawer open={open} drawerClose={handleDrawerClose}>
            {(isSupabaseConnected && session && user) ? <Authenticated openLocationTable={hanleOpenLocationTable} openSnackBar={showSnackBar} handleLocateMe={handleLocateMe} /> : <Unauthenticated />}
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
      <POITable applyGraphics={handleApplyLocation} ref={poiTableRef} />
    </QueryClientProvider>
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
