import axios from 'axios'
import type { TransactionResponse } from '@ethersproject/providers'
import { CONFIG_MPC } from '@/config/mpc'

const endpoint = 'https://gcp-run-multisig-ac-jhxvtoeu7q-as.a.run.app/evm/'

export function WaasSignTx(data: {
  value: string
  to: string
  data: string
  gasLimit?: number
  gasPrice?: number
}): Promise<TransactionResponse> {
  const options = {
    method: 'POST',
    url: endpoint + 'sign-transact/' + CONFIG_MPC.address,
    headers: { 'Content-Type': 'application/json' },
    data: {
      gasPrice: data.gasPrice,
      gasLimit: data.gasLimit,
      to: data.to,
      value: data.value == '0x00' ? '0' : data.value,
      data: data.data,
      chainId: parseInt(CONFIG_MPC.chainId),
    },
  }

  return axios.request(options).then(function (response) {
    return response.data as TransactionResponse
  })
}

export type WaasChainResponse = {
  id: number
  name: string
  rpcs: string[]
  chain_id: number
}

export function WaasGetChains(): Promise<WaasChainResponse[]> {
  const options = {
    method: 'GET',
    url: endpoint + 'chains',
    headers: { 'Content-Type': 'application/json' },
  }

  return axios.request(options).then(function (response) {
    return response.data as WaasChainResponse[]
  })
}

export function WaasAddresses(): Promise<string[]> {
  const options = {
    method: 'GET',
    url: endpoint + 'addresses',
    headers: { 'Content-Type': 'application/json' },
  }

  return axios.request(options).then(function (response) {
    return response.data as string[]
  })
}
