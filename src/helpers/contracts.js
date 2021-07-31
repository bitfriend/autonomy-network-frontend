import { AbiCoder } from '@ethersproject/abi';
import { Contract } from '@ethersproject/contracts';
import convert from 'ether-converter';

import addresses from '../contracts/addresses.json';
import Registry from '../contracts/abis/Registry.json';

const SUCCESS_MSG = 'Success! Transaction has been submitted to the network. Please wait for confirmation on the blockchain.';
const EXTRACT_ERROR_MESSAGE = /(?<="message":")(.*?)(?=")/g;

/*
 *  helper functions
 */

function catchError(error) {
  console.error(error.message);

  // try to extract error message, otherwise return raw error
  let formatted_error;

  if (error.message.startsWith('invalid ENS name')) {
    formatted_error = 'Missing or invalid parameter.';
  } else if (error.message.startsWith('invalid BigNumber string')) {
    formatted_error = 'Invalid number parameter.';
  } else {
    try {
      let errors = JSON.stringify(error).match(EXTRACT_ERROR_MESSAGE);
      formatted_error = errors[errors.length - 1];
    } catch (e) {
      formatted_error = error.message;
    }
  }

  return formatted_error;
}

// Helper function to prevent ambiguous failure message when dates aren't passed
function convertToZeroIfBlank(num) {
  return parseInt(num) || 0;
}

function toUnixTime(date) {
  // Return date if not a Date object
  if (Object.prototype.toString.call(date) !== '[object Date]') {
    return date;
  }
  return parseInt((date.getTime() / 1000).toFixed(0));
}

export async function getBlockNumber(w3provider) {
  return w3provider.getBlockNumber();
}

export function encodeParameters(types, values) {
  const abi = new AbiCoder();
  return abi.encode(types, values);
}

export function decodeParameters(types, values) {
  const abi = new AbiCoder();
  return abi.decode(types, values);
}

export function formatDate(timestamp) {
  if (timestamp === 0) {
    return 'None';
  } else {
    return new Date(timestamp * 1000).toLocaleString();
  }
}

/*
 *  Registry contract functions
 */

function getRegistryContract(w3provider) {
  return new Contract(addresses["ropsten"].registry.address, Registry.abi, w3provider);
}

//////////////////////////////////////////////////////////////
//                                                          //
//                      Hashed Requests                     //
//                                                          //
//////////////////////////////////////////////////////////////

/**
 * @notice  Creates a new request, logs the request info in an event, then saves
 *          a hash of it on-chain in `_hashedReqs`
 * @param target    The contract address that needs to be called
 * @param callData  The calldata of the call that the request is to make, i.e.
 *                  the fcn identifier + inputs, encoded
 * @param verifySender  Whether the 1st input of the calldata equals the sender. Needed
 *                      for dapps to know who the sender is whilst ensuring that the sender intended
 *                      that fcn and contract to be called - dapps will require that msg.sender is
 *                      the Verified Forwarder, and only requests that have `verifySender` = true will
 *                      be forwarded via the Verified Forwarder, so any calls coming from it are guaranteed
 *                      to have the 1st argument be the sender
 * @param payWithAUTO   Whether the sender wants to pay for the request in AUTO
 *                      or ETH. Paying in AUTO reduces the fee
 * @param ethForCall    The ETH to send with the call
 * @param referer       The referer to get rewarded for referring the sender
 *                      to using Autonomy. Usally the address of a dapp owner
 * @return id   The id of the request, equal to the index in `_hashedReqs`
 */
export async function newRec(
  w3provider,
  target,
  referer,
  callData,
  ethForCall,
  verifySender,
  payWithAUTO
) {
  const contract = getRegistryContract(w3provider);
  try {
    const id = await contract.newRec(
      target,
      referer,
      callData,
      ethForCall,
      verifySender,
      payWithAUTO
    );
    return id;
  } catch (e) {
    return e.message;
  }
}

/**
 * @notice  Gets all keccak256 hashes of encoded requests. Completed requests will be 0x00
 * @return  [bytes32[]] An array of all hashes
 */
export async function getHashedReqs(w3provider) {
  const contract = getRegistryContract(w3provider);
  try {
    const hashes = await contract.getHashedReqs();
    return hashes;
  } catch (e) {
    return e.message;
  }
}

/**
 * @notice  Gets part of the keccak256 hashes of encoded requests. Completed requests will be 0x00.
 *          Needed since the array will quickly grow to cost more gas than the block limit to retrieve.
 *          so it can be viewed in chunks. E.g. for an array of x = [4, 5, 6, 7], x[1, 2] returns [5],
 *          the same as lists in Python
 * @param startIdx  [uint] The starting index from which to start getting the slice (inclusive)
 * @param endIdx    [uint] The ending index from which to start getting the slice (exclusive)
 * @return  [bytes32[]] An array of all hashes
 */
export async function getHashedReqsSlice(w3provider, startIdx, endIdx) {
  const contract = getRegistryContract(w3provider);
  try {
    const hashes = await contract.getHashedReqsSlice(startIdx, endIdx);
    return hashes;
  } catch (e) {
    return e.message;
  }
}

/**
 * @notice  Gets the total number of requests that have been made, hashed, and stored
 * @return  [uint] The total number of hashed requests
 */
export async function getHashedReqsLen(w3provider) {
  const contract = getRegistryContract(w3provider);
  try {
    const len = await contract.getHashedReqsLen();
    return len;
  } catch (e) {
    return e.message;
  }
}

/**
 * @notice      Gets a single hashed request
 * @param id    [uint] The id of the request, which is its index in the array
 * @return      [bytes32] The sha3 hash of the request
 */
export async function getHashedReq(w3provider, id) {
  const contract = getRegistryContract(w3provider);
  try {
    const hash = await contract.getHashedReq(id);
    return hash;
  } catch (e) {
    return e.message;
  }
}

//////////////////////////////////////////////////////////////
//                                                          //
//                Hashed Requests Unverified                //
//                                                          //
//////////////////////////////////////////////////////////////

/**
 * @notice  Creates a new hashed request by blindly storing a raw hash on-chain. It's 
 *          'unverified' because when executing it, it's impossible to tell whether any
 *          ETH was initially sent with the request etc, so executing this request requires
 *          that the request which hashes to `hashedIpfsReq` has `ethForCall` = 0,
 *          `initEthSend` = 0, `verifySender` = false, and `payWithAUTO` = true
 * @param id    [bytes32] The hash to save. The hashing algo isn't keccak256 like with `newReq`,
 *          it instead uses sha256 so that it's compatible with ipfs - the hash stored on-chain
 *          should be able to be used in ipfs to point to the request which hashes to `hashedIpfsReq`.
 *          Because ipfs doesn't hash only the data stored, it hashes a prepends a few bytes to the
 *          encoded data and appends a few bytes to the data, the hash has to be over [prefix + data + postfix]
 * @return id   The id of the request, equal to the index in `_hashedReqsUnveri`
 */
export async function newHashedReqUnveri(w3provider, hashedIpfsReq) {
  const contract = getRegistryContract(w3provider);
  try {
    const id = await contract.newHashedReqUnveri(hashedIpfsReq);
    return id;
  } catch (e) {
    return e.message;
  }
}

/**
 * @notice  Gets part of the sha256 hashes of ipfs-encoded requests. Completed requests will be 0x00.
 *          Needed since the array will quickly grow to cost more gas than the block limit to retrieve.
 *          so it can be viewed in chunks. E.g. for an array of x = [4, 5, 6, 7], x[1, 2] returns [5],
 *          the same as lists in Python
 * @param startIdx  [uint] The starting index from which to start getting the slice (inclusive)
 * @param endIdx    [uint] The ending index from which to start getting the slice (exclusive)
 * @return  [bytes32[]] An array of all hashes
 */
export async function getHashedReqsUnveriSlice(w3provider, startIdx, endIdx) {
  const contract = getRegistryContract(w3provider);
  try {
    const hashes = await contract.getHashedReqsUnveriSlice(startIdx, endIdx);
    return hashes;
  } catch (e) {
    return e.message;
  }
}

/**
 * @notice  Gets all sha256 hashes of ipfs-encoded requests. Completed requests will be 0x00
 * @return  [bytes32[]] An array of all hashes
 */
export async function getHashedReqsUnveri(w3provider) {
  const contract = getRegistryContract(w3provider);
  try {
    const hashes = await contract.getHashedReqsUnveri();
    return hashes;
  } catch (e) {
    return e.message;
  }
}

/**
 * @notice  Gets the total number of unverified requests that have been stored
 * @return  [uint] The total number of hashed unverified requests
 */
export async function getHashedReqsUnveriLen(w3provider) {
  const contract = getRegistryContract(w3provider);
  try {
    const len = await contract.getHashedReqsUnveriLen();
    return len;
  } catch (e) {
    return e.message;
  }
}

/**
 * @notice      Gets a single hashed unverified request
 * @param id    [uint] The id of the request, which is its index in the array
 * @return      [bytes32] The sha256 hash of the ipfs-encoded request
 */
export async function getHashedReqUnveri(w3provider, id) {
  const contract = getRegistryContract(w3provider);
  try {
    const hash = await contract.getHashedReqUnveri(id);
    return hash;
  } catch (e) {
    return e.message;
  }
}

//////////////////////////////////////////////////////////////
//                                                          //
//                        Hash Helpers                      //
//                                                          //
//////////////////////////////////////////////////////////////

/**
 * @notice      Encode a request into bytes
 * @param r     [request] The request to be encoded
 * @return      [bytes] The bytes array of the encoded request
 */
export async function getReqBytes(w3provider, r) {
  const contract = getRegistryContract(w3provider);
  try {
    const data = await contract.getReqBytes(r);
    return data;
  } catch (e) {
    return e.message;
  }
}

/**
 * @notice      Encode a request into bytes the same way ipfs does - by doing hash(prefix | request | postfix)
 * @param r     [request] The request to be encoded
 * @param dataPrefix    [bytes] The prefix that ipfs prepends to this data before hashing
 * @param dataPostfix   [bytes] The postfix that ipfs appends to this data before hashing
 * @return  [bytes] The bytes array of the encoded request
 */
export async function getIpfsReqBytes(w3provider, r, dataPrefix, dataPostfix) {
  const contract = getRegistryContract(w3provider);
  try {
    const data = await contract.getIpfsReqBytes(r, dataPrefix, dataPostfix);
    return data;
  } catch (e) {
    return e.message;
  }
}

/**
 * @notice      Get the hash of an encoded request, encoding into bytes the same way ipfs
 *              does - by doing hash(prefix | request | postfix)
 * @param r     [request] The request to be encoded
 * @param dataPrefix    [bytes] The prefix that ipfs prepends to this data before hashing
 * @param dataPostfix   [bytes] The postfix that ipfs appends to this data before hashing
 * @return  [bytes32] The sha256 hash of the ipfs-encoded request
 */
export async function getHashedIpfsReq(w3provider, r, dataPrefix, dataPostfix) {
  const contract = getRegistryContract(w3provider);
  try {
    const data = await contract.getHashedIpfsReq(r, dataPrefix, dataPostfix);
    return data;
  } catch (e) {
    return e.message;
  }
}

/**
 * @notice      Get the decoded request back from encoded bytes
 * @param rBytes    [bytes] The encoded bytes version of a request
 * @return r    [Request] The request as a struct
 */
export async function getReqFromBytes(w3provider, rBytes) {
  const contract = getRegistryContract(w3provider);
  try {
    const r = await contract.getReqFromBytes(rBytes);
    return r;
  } catch (e) {
    return e.message;
  }
}

//////////////////////////////////////////////////////////////
//                                                          //
//                         Executions                       //
//                                                          //
//////////////////////////////////////////////////////////////

export async function executeHashedReq(w3provider, id, r) {
  const contract = getRegistryContract(w3provider);
  try {
    const gasUsed = await contract.executeHashedReq(id, r);
    return gasUsed;
  } catch (e) {
    return e.message;
  }
}

/**
 * @dev validCalldata needs to be before anything that would convert it to memory
 *      since that is persistent and would prevent validCalldata, that requries
 *      calldata, from working. Can't do the check in _execute for the same reason
 */
export async function executeHashedReqUnveri(
  w3provider,
  id,
  r,
  dataPrefix,
  dataSurfix
) {
  const contract = getRegistryContract(w3provider);
  try {
    const gasUsed = await contract.executeHashedReqUnveri(
      id,
      r,
      dataPrefix,
      dataSurfix
    );
    return gasUsed;
  } catch (e) {
    return e.message;
  }
}

//////////////////////////////////////////////////////////////
//                                                          //
//                        Cancellations                     //
//                                                          //
//////////////////////////////////////////////////////////////

export async function cancelHashedReq(w3provider, id, r) {
  const contract = getRegistryContract(w3provider);
  try {
    await contract.cancelHashedReq(id, r);
    return SUCCESS_MSG;
  } catch (e) {
    return catchError(e);
  }
}

export async function cancelHashedReqUnveri(
  w3provider,
  id,
  r,
  dataPrefix,
  dataSurfix
) {
  const contract = getRegistryContract(w3provider);
  try {
    await contract.cancelHashedReqUnveri(
      id,
      r,
      dataPrefix,
      dataSurfix
    );
    return SUCCESS_MSG;
  } catch (e) {
    return catchError(e);
  }
}

//////////////////////////////////////////////////////////////
//                                                          //
//                          Getters                         //
//                                                          //
//////////////////////////////////////////////////////////////

export async function getAUTO(w3provider) {
  const contract = getRegistryContract(w3provider);
  try {
    const erc20 = await contract.getAUTO();
    return erc20;
  } catch (e) {
    return e.message;
  }
}

export async function getStakeManager(w3provider) {
  const contract = getRegistryContract(w3provider);
  try {
    const addr = await contract.getStakeManager();
    return addr;
  } catch (e) {
    return e.message;
  }
}

export async function getOracle(w3provider) {
  const contract = getRegistryContract(w3provider);
  try {
    const addr = await contract.getOracle();
    return addr;
  } catch (e) {
    return e.message;
  }
}

export async function getVerifiedForwarder(w3provider) {
  const contract = getRegistryContract(w3provider);
  try {
    const addr = await contract.getVerifiedForwarder();
    return addr;
  } catch (e) {
    return e.message;
  }
}

export async function getReqCountOf(w3provider, addr) {
  const contract = getRegistryContract(w3provider);
  try {
    const res = await contract.getReqCountOf(addr);
    return res;
  } catch (e) {
    return e.message;
  }
}

export async function getExecCountOf(w3provider, addr) {
  const contract = getRegistryContract(w3provider);
  try {
    const res = await contract.getExecCountOf(addr);
    return res;
  } catch (e) {
    return e.message;
  }
}

export async function getReferalCountOf(w3provider, addr) {
  const contract = getRegistryContract(w3provider);
  try {
    const res = await contract.getReferalCountOf(addr);
    return res;
  } catch (e) {
    return e.message;
  }
}
