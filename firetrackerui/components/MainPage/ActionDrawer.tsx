"use client";

import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Drawer from '@mui/material/Drawer';


export const DRAWER_WIDTH = 240;

interface ActionDrawerProps extends React.PropsWithChildren {
  drawerClose: () => void;
  open: boolean;
}

export default function ActionDrawer({ children, drawerClose, open }: ActionDrawerProps) {
  const theme = useTheme();
  return (
    <Drawer
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
        },
      }}
      variant="persistent"
      anchor="right"
      open={open}
    >
      <DrawerHeader>
        <IconButton onClick={drawerClose}>
          {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>
      {children}
    </Drawer>
  )
}

interface DrawerHeaderProps extends React.PropsWithChildren { }
function DrawerHeader({ children }: DrawerHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0 1px',
      justifyContent: 'flex-start'
    }}>
      {children}
    </div>
  );
}