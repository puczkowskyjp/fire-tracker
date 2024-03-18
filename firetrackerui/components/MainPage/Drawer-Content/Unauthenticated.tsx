import React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LoginIcon from '@mui/icons-material/Login';
import Typography from '@mui/material/Typography';

export default function Unauthenticated() {
  return (
    <Box
      role="presentation"
    >
      <Divider />
      <List>
        <ListItem>
          <ListItemButton href='/login'>
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText>Login</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <Typography mx={2} my={2}>
        Fire Watcher can be used to quickly view active wildfires and prescribed burns in the United States.
      </Typography>
      <Divider />
      <Typography mx={2} my={2}>
        Click the Login button to login to your account or create an account.
      </Typography>
      <Divider />
      <Typography mx={2} my={2}>
        Your Fire Watcher account allows you to save your points of interest(POI) on the map.
        After saving your POI, open the grid to apply them to the map.
      </Typography>
    </Box>
  )
}
