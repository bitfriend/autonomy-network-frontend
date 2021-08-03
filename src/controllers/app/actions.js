import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

import * as types from './types';

const web3Modal = new Web3Modal({
  network: 'testnet',
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: process.env.REACT_APP_INFURA_PROJECT_ID
      }
    }
  }
});

export const loadWeb3Modal = () => {
  return (dispatch, getState) => {
    web3Modal.connect().then(async (provider) => {
      try {
        dispatch({
          type: types.LOAD_WEB3_MODAL,
          payload: {
            web3Provider: provider,
            signedInAddress: provider.selectedAddress
          }
        });
      } catch (e) {
        throw e;
      }
    }).catch(e => {
      console.log(e);
    });
  }
}

export const unloadWeb3Modal = () => {
  return (dispatch, getState) => {
    web3Modal.clearCachedProvider();
    dispatch({ type: types.UNLOAD_WEB3_MODAL });
  }
}