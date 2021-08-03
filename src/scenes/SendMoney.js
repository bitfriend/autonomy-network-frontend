import React, { PureComponent } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  withStyles
} from '@material-ui/core';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { compose } from 'redux';
import { connect } from 'react-redux';

import MenuScene from '../components/MenuScene';
import addresses from '../contracts/addresses.json';
import EthSender from '../contracts/abis/EthSender.json';
import Registry from '../contracts/abis/Registry.json';

const styles = (theme) => ({
  innerPadding: {
    height: 'calc(100% - 64px)',
    padding: theme.spacing(2),
    [theme.breakpoints.only('xs')]: {
      padding: theme.spacing(1)
    }
  },
  submit: {
    width: theme.spacing(20),
    marginTop: theme.spacing(2),
    [theme.breakpoints.only('xs')]: {
      marginTop: theme.spacing(1)
    }
  }
})

class SendMoney extends PureComponent {
  state = {
    delay: '',
    amount: '',
    recepient: ''
  }

  onChangeTime = (e) => {
    this.setState({ delay: e.target.value });
  }

  onChangeAmount = (e) => {
    this.setState({ amount: e.target.value });
  }

  onChangeRecepient = (e) => {
    this.setState({ recepient: e.target.value });
  }

  handleSubmit = async () => {
    const web3 = new Web3(this.props.web3Provider);
    const ethSenderContract = new web3.eth.Contract(EthSender.abi, addresses["ropsten"].ethSender.address, {
      from: this.props.signedInAddress,
      // gasPrice: web3.utils.toWei('0.01', 'ether'),
      // gas: 1000000
    });
    // const signer = this.props.web3Provider.getSigner(this.props.signedInAddress);
    // const contractWithSigner = contract.connect(signer);
    const now = Math.floor(new Date().getTime() / 1000); // in seconds
    const time = now + this.state.delay * 60;
    const userAddress = this.state.recepient;
    const callData = ethSenderContract.methods.sendEthAtTime(time, userAddress).encodeABI();

    const registryContract = new web3.eth.Contract(Registry.abi, addresses["ropsten"].registry.address, {
      from: this.props.signedInAddress,
      // gasPrice: web3.utils.toWei('0.01', 'ether'),
      // gas: 1000000
    });
    const target = addresses["ropsten"].ethSender.address;
    const referer = this.state.recepient;
    const ethForCall = web3.utils.toWei(this.state.amount, 'ether');
    const verifySender = false;
    const payWithAUTO = false;
    const req = registryContract.methods.newReq(
      target,
      referer,
      callData,
      ethForCall,
      verifySender,
      payWithAUTO
    );
    // 'value' would be `ethForCall` + 0.01 ETH. The 0.01 ETH is because
    // more ETH needs to be sent to pay for the bot to execute the transaction.
    // On Ropsten, 0.01 ETH above `ethForCall` should be more than enough - any excess
    // that isn't used to pay the executing bot will get sent back to the user.
    const v = new BigNumber(this.state.amount);
    req.send({
      value: web3.utils.toWei(v.plus(0.01).toString(), 'ether')
    });
  }

  render() {
    return (
      <MenuScene>
        <Box
          display="flex"
          alignItems="center"
          className={this.props.classes.innerPadding}
        >
          <Grid container>
            <Grid item md={2} />
            <Grid item md={8} xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Delay"
                    type="number"
                    InputLabelProps={{
                      shrink: true
                    }}
                    variant="outlined"
                    size="small"
                    helperText="The number in minutes"
                    fullWidth
                    value={this.state.delay}
                    onChange={this.onChangeTime}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Amount"
                    type="number"
                    InputLabelProps={{
                      shrink: true
                    }}
                    variant="outlined"
                    size="small"
                    helperText="The amount to transfer"
                    fullWidth
                    value={this.state.amount}
                    onChange={this.onChangeAmount}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Recipient"
                    type="text"
                    InputLabelProps={{
                      shrink: true
                    }}
                    variant="outlined"
                    size="small"
                    helperText="The address of recipient"
                    fullWidth
                    value={this.state.recepient}
                    onChange={this.onChangeRecepient}
                  />
                </Grid>
              </Grid>
              <Box display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.handleSubmit}
                  className={this.props.classes.submit}
                >
                  Submit
                </Button>
              </Box>
            </Grid>
            <Grid item md={2} />
          </Grid>
        </Box>
      </MenuScene>
    );
  }
}

const mapStateToProps = ({ app }) => ({
  web3Provider: app.web3Provider,
  signedInAddress: app.signedInAddress
});

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(SendMoney);