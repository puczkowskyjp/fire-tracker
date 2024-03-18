"use client"
import React, { forwardRef, useMemo, useState } from 'react';
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { createClient } from '@/utils/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useImperativeHandle } from 'react';
import Snackbar from '@mui/material/Snackbar';
import { Typography } from '@mui/material';


export type POITableRef = {
  handleOpen: () => void;
}
interface POITableProps {
  applyGraphics: (json: string[]) => void;
}
export default forwardRef(function POITable({ applyGraphics }: POITableProps, ref) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);
  const [deleteWarn, setDeleteWarn] = useState(false);
  
  const queryClient = useQueryClient();

  useImperativeHandle(ref, () => ({ handleOpen }));

  const columns = useMemo<MRT_ColumnDef<CaseLocation>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      size: 150
    },
    {
      accessorKey: 'description',
      header: 'Description',
      size: 150
    }

  ], []);

  const getLocations = async () => {
    try {

      const { data: { session } } = await supabase.auth.getSession();
      let { data: locations } = await supabase
        .from('locations')
        .select('*');
      return locations;
    }
    catch (e) {
      throw e;
    }
  }

  const { data: locations = [], isLoading, error } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations
  });

  const table = useMaterialReactTable({
    columns,
    data: locations as CaseLocation[],
    enableRowSelection: true,
    state: {
      isLoading: isLoading,
    },
    muiTableContainerProps: {
      sx: {
        minHeight: '300px',
        minWidth: '600px'
      }
    },
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleApplyToMap = () => {
    const rows = table.getSelectedRowModel().flatRows;
    if (rows.length > 0) {
      const json = rows.map(r => r.original.location);
      applyGraphics(json);
    }
  }

  const deleteLocation = async () => {
    const rows = table.getSelectedRowModel().flatRows;
    if (rows.length > 0) {
      const deleteRows = rows.map(r => r.original.id);
      let { data: locations } = await supabase
        .from('locations')
        .delete()
        .in('id', [deleteRows]);
    }
  }

  const { mutateAsync: deleteLocationData } = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setOpenSnack(true);
    }
  });

  const deleteWarnHandler = () => {
    setDeleteWarn(false);
    deleteLocation();
  }

  const disabled = table.getSelectedRowModel().rows.length === 0;
  return (
    <>
      <Modal
        keepMounted={true}
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ backgroundColor: '#fff', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <MaterialReactTable table={table} />
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
            <Button disabled={disabled} variant='contained' sx={{ backgroundColor: '#1976d2 !important', margin: 2 }} color='primary' onClick={handleApplyToMap}>Apply To Map</Button>
            <Button 
              disabled={disabled} 
              variant='contained' 
              sx={{ 
                backgroundColor: '#e65100 !important', 
                margin: 2,
                '&:hover': {
                  backgroundColor: '#e65100 !important'
                }
              }} color='warning' onClick={() => setDeleteWarn(true)}>Delete Location</Button>
            <Button variant='contained' sx={{ backgroundColor: '#1976d2 !important', margin: 2 }} color='primary' onClick={handleClose}>Close</Button>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={deleteWarn}
        onClose={() => setDeleteWarn(false)}
        aria-labelledby="modal-delete-warning"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ backgroundColor: '#fff', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>

          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
            <Typography
              sx={{
                marginTop: 4,
                mx: 4,
                fontSize: 16,
                color: 'black'
              }}
            >
              Are you sure you want to delete the location(s)?
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
            <Button 
              disabled={disabled} 
              variant='contained' 
              sx={{ 
                backgroundColor: '#e65100 !important', 
                margin: 2,
                '&:hover': {
                  backgroundColor: '#e65100 !important'
                }
              }} color='warning' onClick={deleteWarnHandler}>Delete Location</Button>
            <Button variant='contained' sx={{ backgroundColor: '#1976d2 !important', margin: 2 }} color='primary' onClick={() => setDeleteWarn(false)}>Close</Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        action={
          <Button onClick={() => setOpenSnack(false)} color="inherit" size="small">
            X
          </Button>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={openSnack}
        message="Point of Interest Deleted!"
        onClose={() => setOpenSnack(false)}
      />
    </>
  )
});
