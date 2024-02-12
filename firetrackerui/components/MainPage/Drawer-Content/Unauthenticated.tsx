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



export default function Unauthenticated() {
  const [open, setOpen] = React.useState(false);

  const loginHandler = () => {

  }

  return (
    <>
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
          Login to Fire Watcher to save your points of interest(POI) on the map.
          After saving your POI, open the grid to apply them to the map.
        </Typography>
      </Box>
      {/* <Modal open={open}>
        <Login/>
      </Modal> */}
    </>
  )
}
