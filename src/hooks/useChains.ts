import { useMemo } from 'react'
import isEqual from 'lodash/isEqual'
import { type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppSelector } from '@/store'
import { selectChainById, selectChains } from '@/store/chainsSlice'
import { useChainId } from './useChainId'
import { CONFIG_SERVICE_CHAINS } from '@/tests/mocks/chains'

const useChains = (): { configs: ChainInfo[]; error?: string; loading?: boolean } => {
  const state = useAppSelector(selectChains, isEqual)
  console.log('useChains', { state })
  return useMemo(
    () => ({
      configs: CONFIG_SERVICE_CHAINS,
      error: state.error,
      loading: state.loading,
    }),
    [state.error, state.loading],
  )
}

export default useChains

export const useCurrentChain = (): ChainInfo | undefined => {
  const chainId = useChainId()
  const chainInfo = useAppSelector((state) => selectChainById(state, chainId), isEqual)
  console.log('useCurrentChain', { chainId, chainInfo })
  return chainInfo
}
