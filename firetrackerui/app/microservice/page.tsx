"use client";
import AppBar from '@mui/material/AppBar';
import React, { useState } from 'react';
import Box from "@mui/material/Box";
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import Button from '@mui/material/Button';

const IMG_SERVICE = "https://wgnlzahnglcdktkuhomx.supabase.co/functions/v1/get-book-image";

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

interface ImageRequest {
  bookTitle: string;
  orientation?: "all" | "horizontal" | "vertical";
}
interface ImageResponse {
  webformatURL: string;
  largeImageURL: string;
}
export default function Page() {
  const [search, setSearch] = useState('');
  const [imgURL, setImgURL] = useState('');


  const imageSearchHandler = async () => {
    if (search.length === 0) return;
    const request: ImageRequest = {
      bookTitle: search,
      orientation: 'vertical'
    };


    const imageRes = await fetch(
      IMG_SERVICE,
      {
        method: 'POST',
        body: JSON.stringify(request)
      } as RequestInit
    );

    const response: ImageResponse = await imageRes.json();
    setImgURL(response.webformatURL);

  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
      <AppBar position='static'>
        <Search>
          <SearchIconWrapper >
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            onChange={e => setSearch(e.currentTarget.value)}
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>
        <Button color="success" sx={{ backgroundColor: '#0063cc', padding: 2 }} variant='contained' onClick={() => imageSearchHandler()}>Search</Button>
      </AppBar>
      <Box  sx={{ padding: 5, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        {imgURL.length > 0
          ?
          <img
            src={imgURL}
            loading="lazy"
          />
          :
          <div>Search for an image!</div>
        }
      </Box>
    </Box>
  )
}
