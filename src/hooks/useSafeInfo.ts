import { useMemo } from 'react'
import isEqual from 'lodash/isEqual'
import { type SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppSelector } from '@/store'
import { defaultSafeInfo, selectSafeInfo } from '@/store/safeInfoSlice'
import { CONFIG_MPC } from '@/config/mpc'

const useSafeInfo = (): {
  safe: SafeInfo
  safeAddress: string
  safeLoaded: boolean
  safeLoading: boolean
  safeError?: string
} => {
  const { data, error, loading } = useAppSelector(selectSafeInfo, isEqual)
  console.log({ data, error, loading })
  return useMemo(
    () => ({
      safe: defaultSafeInfo,
      safeAddress: data?.address.value || CONFIG_MPC.address,
      safeLoaded: true,
      safeError: undefined,
      safeLoading: loading,
    }),
    [data, error, loading],
  )
}

export default useSafeInfo
