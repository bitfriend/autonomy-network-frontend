import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import './App.css';
import WalletButton from './components/WalletButton';

class App extends PureComponent {
  render() {
    console.log(this.props.loading);
    return (
      <div className="App">
        <WalletButton />
      </div>
    );
  }
}

const mapStateToProps = ({ app }) => ({
  web3Provider: app.web3Provider,
  signedInAddress: app.signedInAddress
});

export default connect(mapStateToProps)(App);
