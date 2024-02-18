import React, { useState } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Grow,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaMapMarkerAlt,
} from 'react-icons/fa';

// Theme and styles
const livraisonTheme = createTheme({
  palette: {
    primary: {
      main: '#e74c3c',
    },
    secondary: {
      main: '#e74c3c',
    },
    text: {
      primary: '#333333',
      secondary: '#777777',
    },
    background: {
      default: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: ['Arial', 'sans-serif'].join(','),
  },
});

const LogoContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
});

const Logo = styled('img')({
  width: '100px',
  marginRight: '10px',
});

const TrackingInterface = () => {
  const [colisDetails, setColisDetails] = useState({});
  const [codeBarreDuColis, setCodeBarreDuColis] = useState('');
  const [numeroTelephoneDestinataire, setNumeroTelephoneDestinataire] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputErrors, setInputErrors] = useState({
    colis: false,
    telephone: false,
  });

  const fetchColisDetails = async () => {
    setLoading(true);
    setInputErrors({ colis: false, telephone: false });
    try {
      if (!/^\d{12}$/.test(codeBarreDuColis)) {
        setInputErrors((prevState) => ({ ...prevState, colis: true }));
        setLoading(false);
        return;
      }
      if (!/^\d{8}$/.test(numeroTelephoneDestinataire)) {
        setInputErrors((prevState) => ({ ...prevState, telephone: true }));
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://fparcel.net:59/WebServiceExterne/tracking_position_STG?POSBARCODE=${codeBarreDuColis}&POSPORTABLE=${numeroTelephoneDestinataire}`
      );

      if (response.data === 'inexistant') {
        console.log('Colis introuvable');
        setColisDetails({});
        setInputErrors({ colis: true, telephone: false });
      } else {
        const sortedEvenements = response.data.evenements.sort((a, b) =>
          a.date.localeCompare(b.date)
        );
        setColisDetails({ ...response.data, evenements: sortedEvenements });
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du colis :', error);
      setLoading(false);
    }
  };

  const eventIcons = {
    'Réception HUB': FaTruck,
    'Anomalie livraison': FaTimesCircle,
    'Livraison planifiée en cours de tournée': FaCalendarAlt,
    'Colis validé': FaCheckCircle,
    'Tentative enlevement': FaUser,
    'Enlevement en cours de tournée': FaTruck,
    'Planification enlevement': FaClock,
    'Création étiquette position': FaMapMarkerAlt,
  };

  const renderEventList = () => {
    return colisDetails.evenements.map((evenement, index) => {
      const EventIcon = eventIcons[evenement.evenement] || FaCheckCircle;
      return (
        <Grow in={true} key={index} timeout={300 * index}>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <EventIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={evenement.evenement}
              secondary={new Date(parseInt(evenement.date.substr(6))).toLocaleString()}
            />
          </ListItem>
        </Grow>
      );
    });
  };

  return (
    <ThemeProvider theme={livraisonTheme}>
      <CssBaseline />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" color="primary" elevation={2}>
          <Toolbar>
            <LogoContainer>
              <Logo src="/logo.png" alt="Logo de Livraison Express" />
              <Typography variant="h5" color="inherit">
                Livraison Express
              </Typography>
            </LogoContainer>
          </Toolbar>
        </AppBar>

        <Container
          maxWidth="md"
          className="mt-4"
          style={{
            backgroundColor: livraisonTheme.palette.background.default,
            minHeight: '100vh',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Card elevation={3} className="mb-4" style={{ width: '100%', maxWidth: '500px', borderRadius: '8px' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {inputErrors.colis && (
                    <Alert severity="error" style={{ position: 'absolute', left: '20px', bottom: '20px' }}>
                      Le numéro de colis est invalide. Veuillez vérifier la saisie.
                    </Alert>
                  )}
                  {inputErrors.telephone && (
                    <Alert severity="error" style={{ position: 'absolute', left: '20px', bottom: '20px' }}>
                      Le numéro de téléphone est invalide. Veuillez vérifier la saisie.
                    </Alert>
                  )}
                  <Typography variant="h6" style={{ color: livraisonTheme.palette.text.primary }}>
                    Suivre Votre Colis
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    style={{ color: livraisonTheme.palette.text.secondary, marginTop: '10px' }}
                  >
                    Entrez le code à barres du colis et le numéro de téléphone pour suivre la livraison.
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Code à Barres du Colis"
                    variant="outlined"
                    fullWidth
                    size="medium"
                    value={codeBarreDuColis}
                    onChange={(e) => {
                      if (e.target.value.length <= 12) {
                        setCodeBarreDuColis(e.target.value);
                      }
                    }}
                    error={inputErrors.colis}
                    helperText={inputErrors.colis && 'Le numéro de colis doit contenir 12 chiffres'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Numéro de Téléphone du Destinataire"
                    variant="outlined"
                    fullWidth
                    size="medium"
                    value={numeroTelephoneDestinataire}
                    onChange={(e) => {
                      if (e.target.value.length <= 8) {
                        setNumeroTelephoneDestinataire(e.target.value);
                      }
                    }}
                    error={inputErrors.telephone}
                    helperText={
                      inputErrors.telephone && 'Le numéro de téléphone doit contenir 8 chiffres'
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={fetchColisDetails}
                    style={{ width: '100%' }}
                  >
                    Suivre le Colis
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <CircularProgress color="secondary" />
            </div>
          )}

          {colisDetails.evenements && colisDetails.evenements.length > 0 && (
            <Card elevation={3} className="mb-4" style={{ width: '100%', maxWidth: '800px', borderRadius: '8px' }}>
              <CardContent>
                <Typography variant="h6" style={{ color: livraisonTheme.palette.text.primary }}>
                  Chronologie des Événements
                </Typography>
                <List>{renderEventList()}</List>
              </CardContent>
            </Card>
          )}

          <footer
            className="footer"
            style={{
              backgroundColor: livraisonTheme.palette.background.default,
              padding: '20px',
              textAlign: 'center',
              marginTop: 'auto',
              borderRadius: '8px',
              color: '#000',
              width: '100%',
              maxWidth: '800px',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              &copy; {new Date().getFullYear()} Livraison Express. Tous droits réservés.
            </p>
          </footer>
        </Container>
      </div>
    </ThemeProvider>
  );
};

export default TrackingInterface;
