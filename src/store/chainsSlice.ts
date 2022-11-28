import { type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '.'
import { makeLoadableSlice } from './common'
import { CONFIG_SERVICE_CHAINS } from '@/tests/mocks/chains'

// const initialState: ChainInfo[] = []

const { slice, selector } = makeLoadableSlice('chains', CONFIG_SERVICE_CHAINS)

export const chainsSlice = slice
export const selectChains = selector

export const selectChainById = createSelector(
  [selectChains, (_: RootState, chainId: string) => chainId],
  (chains, chainId) => {
    const selected = CONFIG_SERVICE_CHAINS.find((item: ChainInfo) => item.chainId === chainId)
    console.log('selectChainById', { chainId, selected, chains })
    return selected
  },
)
