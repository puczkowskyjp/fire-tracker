import { AppBar, Typography, Toolbar, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface HeaderProps {
  menuCallback?: () => void;
  open?: boolean;
  showMenu: boolean;
  user?: string;
}

export default function Header({ menuCallback, open, showMenu, user }: HeaderProps) {
  return (
    <AppBar position="static">
      <Toolbar >
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Fire Watcher
        </Typography>

        {user && 
          <Typography
          noWrap
          component="div"
          sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Welcome {user}!
          </Typography>
        }

        {showMenu &&
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={menuCallback}
            sx={{ ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
        }
      </Toolbar>
    </AppBar>
  );
}
