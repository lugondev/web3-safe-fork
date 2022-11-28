import { CONFIG_MPC } from '@/config/mpc'

const useSafeAddress = (): string => {
  // const router = useRouter()
  // const { safe = '' } = router.query
  // const fullAddress = Array.isArray(safe) ? safe[0] : safe
  //
  // const checksummedAddress = useMemo(() => {
  //   if (!fullAddress) return ''
  //   const { address } = parsePrefixedAddress(fullAddress)
  //   return address
  // }, [fullAddress])
  //
  // console.log({ fullAddress, checksummedAddress })
  // return checksummedAddress

  return CONFIG_MPC.address
}

export default useSafeAddress
