import { useAppDispatch } from '@/store'
import { setLastChainId, setLastSafeAddress } from '@/store/sessionSlice'
import { useEffect } from 'react'
import { useUrlChainId } from './useChainId'
import useSafeInfo from './useSafeInfo'
import { CONFIG_MPC } from '@/config/mpc'

export const useInitSession = (): void => {
  const dispatch = useAppDispatch()
  const chainId = useUrlChainId()
  // N.B. only successfully loaded Safes, don't use useSafeAddress() here!
  const { safe, safeAddress } = useSafeInfo()
  console.log({ safe, safeAddress })

  useEffect(() => {
    if (chainId) {
      console.log('useInitSession: setting last chain id', chainId)
      dispatch(setLastChainId(chainId))
    }
  }, [dispatch, chainId])

  useEffect(() => {
    if (!safeAddress) return

    dispatch(
      setLastSafeAddress({
        // This chainId isn't necessarily the same as the current chainId
        chainId: CONFIG_MPC.chainId,
        safeAddress: CONFIG_MPC.address,
      }),
    )
  }, [dispatch, safe.chainId, safeAddress])
}
