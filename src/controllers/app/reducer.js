import * as types from './types';

const initialState = {
  themeMode: 'light',
  web3Provider: null,
  signedInAddress: ''
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.LOAD_WEB3_MODAL:
      const { web3Provider, signedInAddress } = action.payload;
      return {
        ...state,
        web3Provider,
        signedInAddress
      };
    case types.UNLOAD_WEB3_MODAL:
      // setTimeout(() => {
      //   window.location.reload();
      // }, 1000);
      return {
        ...state,
        web3Provider: null,
        signedInAddress: ''
      };
    default:
      return state;
  }
}

export default appReducer;