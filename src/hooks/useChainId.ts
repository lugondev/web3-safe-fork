import { parse, type ParsedUrlQuery } from 'querystring'
import { IS_PRODUCTION } from '@/config/constants'
import chains from '@/config/chains'
import { prefixedAddressRe } from '@/utils/url'
import { CONFIG_MPC } from '@/config/mpc'

const defaultChainId = IS_PRODUCTION ? chains.eth : chains.gor

// Use the location object directly because Next.js's router.query is available only in an effect
const getLocationQuery = (): ParsedUrlQuery => {
  if (typeof location === 'undefined') return {}

  const query = parse(location.search.slice(1))

  if (!query.safe) {
    const pathParam = location.pathname.split('/')[1]
    const safeParam = prefixedAddressRe.test(pathParam) ? pathParam : ''

    // Path param -> query param
    if (prefixedAddressRe.test(pathParam)) {
      query.safe = safeParam
    }
  }

  return query
}

export const useUrlChainId = (): string | undefined => {
  // const router = useRouter()
  // Dynamic query params are available only in an effect
  // const query = router && (router.query.safe || router.query.chain) ? router.query : getLocationQuery()
  // const chain = query.chain?.toString() || ''
  // const safe = query.safe?.toString() || ''
  //
  // const { prefix } = parsePrefixedAddress(safe)
  // const shortName = prefix || chain
  // console.log({ shortName, chain, safe, query })
  //
  // return Object.entries(chains).find(([key]) => key === shortName)?.[1]
  return CONFIG_MPC.chainId
}

export const useChainId = (): string => {
  // const session = useAppSelector(selectSession)
  // const urlChainId = useUrlChainId()
  // return urlChainId || session.lastChainId || defaultChainId
  return CONFIG_MPC.chainId
}

export default useChainId
