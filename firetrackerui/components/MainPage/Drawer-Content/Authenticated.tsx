import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LoginIcon from '@mui/icons-material/Login';
import Typography from '@mui/material/Typography';
import { createClient } from '@/utils/supabase/client';

interface AuthenticatedProps {
  openSnackBar: (val: boolean) => void;
}

export default function ({ openSnackBar }: AuthenticatedProps) {
  const supabase = createClient();

  const onLogout = () => {
    supabase.auth.signOut()
      .then((result) => {
        console.log(result)
        if (result.error === null) {
          openSnackBar(true);
        }
      })
      .catch(err => console.error(err));
  }
  return (
    <>
      <Box role="presentation">
        <Divider />
        <List>
          <ListItem>
            <ListItemButton onClick={onLogout}>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText>Log Out</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <Typography mx={2} my={2}>
          Fire Watcher allows users to save points of interest(POI) on the map.
          Explore the map and find fires around the United States.
          On the map click the <i className='esri-icon-edit'></i> widget to expand, 
          and start drawing your POI's.
        </Typography>
      </Box>
    </>
  )
}
