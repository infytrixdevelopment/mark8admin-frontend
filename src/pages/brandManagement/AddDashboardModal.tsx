import React, { useState, useEffect } from 'react';
import {
  Modal, ModalDialog, DialogTitle, DialogContent, Stack, FormControl, FormLabel,
  Select, Option, Button, Input, CircularProgress, Box, Typography
} from '@mui/joy';
import { TEXT_PRIMARY } from '../../constants/textColorsConstants';
import toast from 'react-hot-toast';
import axios from 'axios';
import { BASE_URL } from '../../constants/appConstants';


const getToken = () => localStorage.getItem('token');

type PbiDashboard = {
  dashboard_id: string;
  dashboard_type: string;
};

type PbiDashboardData = {
  masterDashboardId: string;
  dashboardType: string;
  workspaceId: string;
  reportId: string;
  datasetId: string;
  url: string; // Not in UI, but needed
};

// --- This prop list is correct ---
type AddDashboardModalProps = {
  open: boolean;
  onClose: () => void;
  appName: string;
  brandName: string; 
  platformName: string;
  existingData?: PbiDashboardData;
  onSubmit: (data: Omit<PbiDashboardData, 'platformId'>) => void;
};

const AddDashboardModal: React.FC<AddDashboardModalProps> = ({
  open, onClose, appName, brandName, platformName, existingData, onSubmit
}) => {
  const [pbiDashboards, setPbiDashboards] = useState<PbiDashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [masterId, setMasterId] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [reportId, setReportId] = useState('');
  const [datasetId, setDatasetId] = useState('');
  const [url, setUrl] = useState(''); 

  // Pre-fill form if editing
  useEffect(() => {
    if (existingData) {
      setMasterId(existingData.masterDashboardId);
      setWorkspaceId(existingData.workspaceId);
      setReportId(existingData.reportId);
      setDatasetId(existingData.datasetId);
      setUrl(existingData.url || '');
    }
  }, [existingData]);

  // Fetch PBI dashboards
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      axios.get(`${BASE_URL}api/admin/brand-mappings/power-bi-dashboards`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      .then(res => {
        if (res.data.success) {
          setPbiDashboards(res.data.data);
        }
      })
      .catch(() => toast.error('Failed to load Power BI dashboards'))
      .finally(() => setIsLoading(false));
    }
  }, [open]);
  
  const handleSave = () => {
    if (!masterId || !workspaceId || !reportId || !datasetId) {
      toast.error('Please fill all 4 fields');
      return;
    }
    
    const selectedDashboard = pbiDashboards.find(d => d.dashboard_id === masterId);
    
    onSubmit({
      masterDashboardId: masterId,
      dashboardType: selectedDashboard?.dashboard_type || 'N/A',
      workspaceId,
      reportId,
      datasetId,
      url: url || '#' 
    });
  };

  const isFormValid = masterId && workspaceId && reportId && datasetId;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          width: 450,
          zIndex: 1301, 
        }}
      >
        <DialogTitle>Add Dashboard</DialogTitle>
        {/* --- This DialogContent is now correct --- */}
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
            <Typography level="body-sm" sx={{ mr: 0.5 }}>
              Map dashboard for:
            </Typography>
            <Typography level="title-sm" sx={{ color: TEXT_PRIMARY.PURPLE }}>
              {appName}
            </Typography>
            <Typography level="body-sm" sx={{ color: TEXT_PRIMARY.GREY, mx: 0.5 }}>
              →
            </Typography>
            <Typography level="title-sm" sx={{ color: TEXT_PRIMARY.PURPLE }}>
              {brandName}
            </Typography>
            <Typography level="body-sm" sx={{ color: TEXT_PRIMARY.GREY, mx: 0.5 }}>
              →
            </Typography>
            <Typography level="title-sm" sx={{ color: TEXT_PRIMARY.PURPLE }}>
              {platformName}
            </Typography>
          </Box>
        </DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {isLoading ? <CircularProgress sx={{ m: 'auto' }} /> : (
            <>
              <FormControl>
                <FormLabel>Select Dashboard:</FormLabel>
                <Select
                  value={masterId}
                  onChange={(_, val) => setMasterId(val as string)}
                  placeholder="Choose Power BI dashboard..."
                >
                  {pbiDashboards.map(dash => (
                    <Option key={dash.dashboard_id} value={dash.dashboard_id}>
                      {dash.dashboard_type}
                    </Option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Workspace ID:</FormLabel>
                <Input
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  placeholder="Enter Workspace ID"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Report ID:</FormLabel>
                <Input
                  value={reportId}
                  onChange={(e) => setReportId(e.target.value)}
                  placeholder="Enter Report ID"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Dataset ID:</FormLabel>
                <Input
                  value={datasetId}
                  onChange={(e) => setDatasetId(e.target.value)}
                  placeholder="Enter Dataset ID"
                />
              </FormControl>

              <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 2 }}>
                <Button variant="outlined" color="neutral" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={!isFormValid}
                  sx={{ backgroundColor: TEXT_PRIMARY.PURPLE }}
                >
                  Save Dashboard
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default AddDashboardModal;