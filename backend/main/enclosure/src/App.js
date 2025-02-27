import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const App = () => {
  const [userPrompt, setUserPrompt] = useState("");  
  const [baseJson, setBaseJson] = useState(`
    {
      "shape": "rectangle",
      "pcbType": "custom",
      "customPcbDetails": {
        "length": ,
        "width": ,
        "thickness": ,
        "mountingHoleDia": ,
        "distanceBetweenEdgesOfHoles": ,
        "hole1Hole2": ,
        "hole3Hole4": ,
        "hole1Hole4": ,
        "hole2Hole3": 
      },
      "enclosureDimensions": {
        "length": ,
        "width": ,
        "height": ,
        "wallThickness": ,
        "hasCornerRadius": true/false,
        "cornerRadius": 
      },
      "lidDimensions": { "height":  },
      "Text": { "position": "top", "content": "stel", "type": "emboss", "size": 2 },
      "color": "#2bb1ae",
      "showPCB": false,
      "showLid": true,
      "showEnclosure": true,
      "lockingType": {
        "lockingType": "screw",
        "screwSize": "M1",
        "screwPosition": "corners",
        "snapFit": ""
      },
      "pcbMounts": { "pcbMounts": "studs", "studPosition": "center" },
      "enclosureMountType": "",
      "cutouts": [ 
        {
          "type": "custom",
          "position": "", 
          "Xvalue": ,
          "Yvalue": ,
          "shape": "rectangle",
          "length": ,
          "width": ,
          "diameter": "",
          "Component Name":""
        },
        {
          "type": "custom",
          "position": "", 
          "Xvalue": ,
          "Yvalue": ,
          "shape": "rectangle",
          "length": ,
          "width": ,
          "diameter": "",
          "Component Name":""
        },
        {
          "type": "custom",
          "position": "", 
          "Xvalue": ,
          "Yvalue": ,
          "shape": "rectangle",
          "length": ,
          "width": ,
          "diameter": "",
          "Component Name":""
        },
        {
          "type": "custom",
          "position": "", 
          "Xvalue": ,
          "Yvalue": ,
          "shape": "rectangle",
          "length": ,
          "width": ,
          "diameter": "",
          "Component Name":""
        }
      ],
      "addOns": { "addOn": "", "position": "" }
    }`);
  const [generatedJson, setGeneratedJson] = useState("");
  const [cutoutJson, setCutoutJson] = useState([]);
  const [isSatisfied, setIsSatisfied] = useState(false);
  const [modificationDialogOpen, setModificationDialogOpen] = useState(false);
  const [modificationInput, setModificationInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [fadeState, setFadeState] = useState(true);

  const handleGenerate = async () => {
    setIsLoading(true); // Show loading
    try {
      const response = await fetch("http://localhost:5001/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userPromptPart: userPrompt,  baseJson }),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedJson(data.generatedJson);
        setCutoutJson(data.cutoutJson || []); // Set the cutout table
      } else {
        alert("Error generating JSON: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false); // Hide loading
    }
  };

  const handleModify = async () => {
    setIsLoading(true); // Show loading
    try {
      const response = await fetch("http://localhost:5001/modify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ modificationInput, baseJson: generatedJson }),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedJson(data.updatedJson);
        setCutoutJson(data.updatedTable || []); // Update the cutout table
        setModificationDialogOpen(false); // Close dialog
      } else {
        alert("Error modifying JSON: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false); // Hide loading
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(to right, #ffe3e3, #ffffff)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#333333",
      }}
    >
      <Container maxWidth="lg">
        <Box mt={4}>
          <Typography variant="h4" align="center" gutterBottom>
            Enclosure Generator
          </Typography>
          <Card sx={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customize Your Enclosure
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                label="Describe your customization"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerate}
                disabled={isLoading}
                sx={{ mr: 2 }}
              >
                {isLoading ? (
                  <CircularProgress size={20} sx={{ color: "#ffffff" }} />
                ) : (
                  "Generate JSON"
                )}
              </Button>
            </CardContent>
          </Card>

          {isLoading && (
            <Typography align="center" sx={{ mt: 2, color: "gray" }}>
              Processing, please wait...
            </Typography>
          )}

          {generatedJson && !isLoading && (
            <Grid container spacing={4} mt={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  Generated JSON:
                </Typography>
                <Fade in timeout={300}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        component="pre"
                        sx={{
                          whiteSpace: "pre-wrap",
                          background: "#f9f9f9",
                          padding: 2,
                          borderRadius: 1,
                        }}
                      >
                        {generatedJson}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              <Grid item xs={44} md={22}>
                <Typography variant="h5" gutterBottom>
                  Cutout Table:
                </Typography>
                <Fade in timeout={300}>
                  <Card variant="outlined">
                    <CardContent>
                      <TableContainer component={Paper} style={{ width: '100%' }}>
                        <Table style={{ tableLayout: 'auto', width: '100%' }}>
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Component Name</strong></TableCell>
                              <TableCell><strong>Position</strong></TableCell>
                              <TableCell><strong>Length</strong></TableCell>
                              <TableCell><strong>Width</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {cutoutJson.length > 0 ? (
                              cutoutJson.map((cutout, index) => (
                                <TableRow key={index}>
                                  <TableCell>{cutout.componentname || "N/A"}</TableCell>
                                  <TableCell>{cutout.position || "N/A"}</TableCell>
                                  <TableCell>{cutout.suitablelength || "N/A"}</TableCell>
                                  <TableCell>{cutout.suitablewidth || "N/A"}</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} align="center">
                                  No Cutouts Available
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            </Grid>
          )}

          {/* Modify Button */}
          {generatedJson && !isLoading && (
            <Box textAlign="center" mt={2}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setModificationDialogOpen(true)}
              >
                Modify JSON
              </Button>
            </Box>
          )}

          {/* Modification Dialog */}
          <Dialog
            open={modificationDialogOpen}
            onClose={() => setModificationDialogOpen(false)}
          >
            <DialogTitle>Modify JSON</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                multiline
                minRows={3}
                variant="outlined"
                label="Describe the modification"
                value={modificationInput}
                onChange={(e) => setModificationInput(e.target.value)}
                InputProps={{
                  style: { overflowY: "auto" },
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setModificationDialogOpen(false)}
                color="secondary"
              >
                Cancel
              </Button>
              <Button onClick={handleModify} color="primary" disabled={isLoading}>
                {isLoading ? (
                  <CircularProgress size={20} sx={{ color: "#ffffff" }} />
                ) : (
                  "Apply Changes"
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </Box>
  );
};

export default App;
