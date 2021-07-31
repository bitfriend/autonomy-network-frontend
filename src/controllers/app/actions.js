import Web3Modal from 'web3modal';
import { Web3Provider } from '@ethersproject/providers';
import WalletConnectProvider from '@walletconnect/web3-provider';

import * as types from './types';
import { newRec } from '../../helpers/contracts';

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
    dispatch(updateLoading(true));
    web3Modal.connect().then(async (provider) => {
      const signedInAddress = provider.selectedAddress;
      const web3Provider = new Web3Provider(provider);
      try {
        dispatch({
          type: types.LOAD_WEB3_MODAL,
          payload: {
            web3Provider,
            signedInAddress
          }
        });
      } catch (e) {
        throw e;
      }
    }).catch(e => {
      dispatch(updateLoading(false));
    });
  }
}

export const unloadWeb3Modal = () => {
  return (dispatch, getState) => {
    web3Modal.clearCachedProvider();
    dispatch({ type: types.UNLOAD_WEB3_MODAL });
  }
}

const updateLoading = (flag) => ({
  type: types.UPDATE_LOADING,
  payload: flag
})