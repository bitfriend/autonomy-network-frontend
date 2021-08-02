import React, { PureComponent } from 'react';
import {
  Box,
  Button,
  Grid,
  Typography,
  withStyles,
  withTheme
} from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { loadWeb3Modal, unloadWeb3Modal } from '../controllers/app/actions';
import { withTransition } from '../helpers/effects';

const styles = (theme) => ({
  root: {
    backgroundColor: theme.palette.background.default
  },
  innerPadding: {
    padding: theme.spacing(2),
    [theme.breakpoints.only('xs')]: {
      padding: theme.spacing(1)
    }
  },
  submit: {
    width: theme.spacing(30),
    marginTop: theme.spacing(2),
    [theme.breakpoints.only('xs')]: {
      marginTop: theme.spacing(1)
    }
  }
})

class Home extends PureComponent {
  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.web3Provider && this.props.web3Provider) {
      this.props.history.push('/send_money');
    }
  }

  handleConnectWallet = () => {
    if (this.props.web3Provider) {
      this.props.history.push('/send_money');
    } else {
      this.props.loadWeb3Modal();
    }
  }

  render() {
    return (
      <div className={this.props.classes.root}>
        <Box
          height="100vh"
          display="flex"
          alignItems="center"
          className={this.props.classes.innerPadding}
        >
          <Grid container>
            <Grid item md={2} />
            <Grid item md={8} xs={12}>
              <Box display="flex" justifyContent="center">
                <Typography align="center" variant="h6">This smart contract is running on Ropsten Testnet</Typography>
              </Box>
              <Box display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.handleConnectWallet}
                  className={this.props.classes.submit}
                >
                  Connect Wallet
                </Button>
              </Box>
            </Grid>
            <Grid item md={2} />
          </Grid>
        </Box>
      </div>
    );
  }
}

const mapStateToProps = ({ app }) => ({
  web3Provider: app.web3Provider,
  signedInAddress: app.signedInAddress
});

const mapDispatchToProps = (dispacth) => ({
  loadWeb3Modal: () => dispacth(loadWeb3Modal()),
  unloadWeb3Modal: () => dispacth(unloadWeb3Modal())
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withRouter,
  withStyles(styles),
  withTheme,
  withTransition
)(Home);
