"use client"
import React, { MutableRefObject, Ref, forwardRef, useMemo, useState } from 'react';
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { createClient } from '@/utils/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useImperativeHandle } from 'react';
import { WebMapRef } from './MainPage/ArcMap';

export type POITableRef = {
  handleOpen: () => void;
}
interface POITableProps {
  applyGraphics: (json: string[]) => void;
}
export default forwardRef(function POITable({ applyGraphics }: POITableProps, ref) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);

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
            <Button variant='contained' sx={{ backgroundColor: '#1976d2 !important', margin: 2 }} color='primary' onClick={handleClose}>Close</Button>
          </Box>
        </Box>
      </Modal>
    </>
  )
});
