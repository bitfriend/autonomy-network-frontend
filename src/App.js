import React, { PureComponent } from 'react';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import { darkTheme, lightTheme } from './helpers/themes';
import Home from './scenes/Home';
import SendMoney from './scenes/SendMoney';
import PrivateRoute from './components/PrivateRoute';
import { compose } from 'redux';
import { connect } from 'react-redux';

class App extends PureComponent {
  render() {
    return (
      <ThemeProvider theme={this.props.themeMode === 'dark' ? darkTheme : lightTheme}>
        <CssBaseline />
        <div className="App">
          <BrowserRouter>
            <Switch>
              <Route exact path="/" component={Home} />
              <PrivateRoute exact path="/send_money" component={SendMoney} />
            </Switch>
          </BrowserRouter>
        </div>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = ({ app }) => ({
  themeMode: app.themeMode
});

export default connect(mapStateToProps)(App);
