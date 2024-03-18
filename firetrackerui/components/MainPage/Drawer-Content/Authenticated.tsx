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
import TextField from '@mui/material/TextField';
import useLocationQuery from '@/hooks/useLocation';
import { useRouter } from 'next/navigation'

interface AuthenticatedProps {
  openSnackBar: (val: boolean) => void;
  handleLocateMe: (val: string[] | undefined) => void;
  openLocationTable: () => void;
}

export default function Authenticated ({ openSnackBar, handleLocateMe, openLocationTable }: AuthenticatedProps) {
  const supabase = createClient();
  const [zip, setZip] = React.useState('');
  const router = useRouter();  

  const { data: location, isLoading, isError } = useLocationQuery(zip);
  
  const onLogout = () => {
    supabase.auth.signOut()
      .then((result) => {
        if (result.error === null) {
          router.push('/');
          openSnackBar(true);
        }
      })
      .catch(err => console.error(err));
  }

  const locateMeHandler = async () => {
    if (!location) return;
    handleLocateMe(location.coordinates);
  }

  const saveLocationHandler = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    await supabase
    .from('account')
    .update(
      { user_location: JSON.stringify(location?.coordinates)}
    ).eq('user_id', session?.user.id);
  }

  const handleLocationTableOpen = () => {
    openLocationTable();
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
        <Button variant='contained' sx={{backgroundColor: '#1976d2 !important', margin: 2 }} color='primary' onClick={handleLocationTableOpen}>Open Location Table</Button>
        <Divider />
        <Typography mx={2} my={2}>
          Enter your zip code to locate yourself on the map.
        </Typography>
        <Box sx={{ padding: 2, }}>
          <TextField id="outlined-basic" label="Locate Me" variant="outlined" value={zip} onChange={e => setZip(e.currentTarget.value)} />
          <Button variant='contained' sx={{backgroundColor: '#1976d2 !important', marginTop: 2 }} color='primary' onClick={locateMeHandler}>Locate Me</Button>
        </Box>
        <Box sx={{ paddingLeft: 2 }}>
          <Button 
            disabled={!zip || !location || isLoading} 
            variant='contained' 
            sx={{backgroundColor: '#1976d2 !important' }} 
            color='primary' onClick={saveLocationHandler}>Save Location</Button>
        </Box>
      </Box>
    </>
  )
}
