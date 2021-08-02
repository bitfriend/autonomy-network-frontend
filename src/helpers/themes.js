import { createTheme } from '@material-ui/core/styles';

export const lightTheme = createTheme({
  palette: {
    type: 'light'
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        html: {
          bacnkgroundColor: '#fafafa'
        }
      }
    }
  }
});

export const darkTheme = createTheme({
  palette: {
    type: 'dark'
  },
  overrides: {}
});