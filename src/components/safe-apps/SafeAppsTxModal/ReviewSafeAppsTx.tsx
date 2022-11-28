import type { ReactElement } from 'react'
import { useEffect, useMemo } from 'react'
import type { DecodedDataResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { getDecodedData, Operation } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { OperationType } from '@gnosis.pm/safe-core-sdk-types'
import { Box, Typography } from '@mui/material'
import SendFromBlock from '@/components/tx/SendFromBlock'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { generateDataRowValue } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import { useCurrentChain } from '@/hooks/useChains'
import { getInteractionTitle } from '../utils'
import type { SafeAppsTxParams } from '.'
import { isEmptyHexData } from '@/utils/hex'
import { dispatchSafeAppsTx } from '@/services/tx/txSender'
import { getAppsUsageData, trackSafeAppTxCount } from '@/services/safe-apps/track-app-usage-count'
import { getTxOrigin } from '@/utils/transactions'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { BigNumber, ethers } from 'ethers'
import { WaasSignTx } from '@/services/waasSignTx'
import { useAppDispatch } from '@/store'
import { Transaction } from 'ethereumjs-tx'
import Common from 'ethereumjs-common'

type ReviewSafeAppsTxProps = {
  safeAppsTx: SafeAppsTxParams
}

const ReviewSafeAppsTx = ({
  safeAppsTx: { txs, requestId, params, appId, app },
}: ReviewSafeAppsTxProps): ReactElement => {
  const chainId = useChainId()
  const chain = useCurrentChain()
  const dispatch = useAppDispatch()

  const isMultiSend = txs.length > 1

  useEffect(() => {
    console.log({ getAppsUsageData: getAppsUsageData() })
    console.log({ txs, requestId, params, appId, app })
  }, [txs, requestId, params, appId, app])

  const txId = useMemo<string>(() => {
    return Math.random().toString().split('.')[1]
  }, [])

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(async () => {
    // const tx = await createMultiSendCallOnlyTx(txs)
    // console.log({ createMultiSendCallOnlyTx: tx })
    const tx = await txs[0]

    return {
      signatures: {},
      data: {
        to: tx.to,
        value: tx.value,
        data: tx.data,
        operation: 0,
        baseGas: 0,
        gasPrice: 0,
        gasToken: '0x0000000000000000000000000000000000000000',
        refundReceiver: '0x0000000000000000000000000000000000000000',
        nonce: 1,
        safeTxGas: 0,
      },
    } as SafeTransaction
  }, [txs])

  useEffect(() => {
    console.log({ safeTx, safeTxError })
    console.log({ safeTxJson: JSON.stringify(safeTx) })
  }, [safeTx])

  const [decodedData] = useAsync<DecodedDataResponse | undefined>(async () => {
    if (!safeTx || isEmptyHexData(safeTx.data.data)) return

    return getDecodedData(chainId, safeTx.data.data)
  }, [safeTx, chainId])

  const handleSubmit1 = (txId: string, txHash: string) => {
    trackSafeAppTxCount(Number(appId))
    dispatchSafeAppsTx(txId, requestId, txHash)
  }
  const handleTest = () => {
    txDispatch(TxEvent.EXECUTING, { txId })
    const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/bsc_testnet_chapel')
    // const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth_goerli')
    const txHash = '0xc02fdf9a0ebf5834ac4e5b40ad8b456914e06062deef4a7366e292e42c2cde4e'
    txDispatch(TxEvent.PROCESSING, {
      txId,
      txHash,
    })
    provider.getTransactionReceipt(txHash).then((receipt) => {
      console.log({ receipt })
      txDispatch(TxEvent.PROCESSED, { txId, receipt })
      handleSubmit1(txId, receipt.transactionHash)
    })
  }

  const handleTest2 = () => {
    const txData = {
      nonce: '0x7',
      gasPrice: '0x2540BE400',
      gasLimit: '0x33450',
      to: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
      value: '0x00',
      data: '0x18cbafe5000000000000000000000000000000000000000000000001aa350befca9bf47e000000000000000000000000000000000000000000000000007b300f38c561b000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000001f38b2f9f8846b14dad6be9c56ab4e4904f21e1700000000000000000000000000000000000000000000000000000000637f4c7b0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000237accec2d562a09b75f3696b25fd98a26a8e85a000000000000000000000000ae13d989dac2f0debff460ac112a837c89baa7cd',
    }
    const tx = new Transaction(txData, {
      common: Common.forCustomChain(
        'mainnet',
        {
          name: 'bnbt',
          networkId: 97,
          chainId: 97,
        },
        'petersburg',
      ),
    })
    console.log({ txHash: tx.hash(false).toString('hex') })
  }

  const origin = useMemo(() => getTxOrigin(app), [app])

  const handleSubmit = (tx: SafeTransaction | undefined) => {
    if (tx) {
      txDispatch(TxEvent.EXECUTING, { txId })
      WaasSignTx({
        to: tx.data.to,
        data: tx.data.data,
        value: BigNumber.from(tx.data.value).toHexString(),
      }).then((res) => {
        txDispatch(TxEvent.PROCESSING, {
          txId,
          txHash: res.hash,
        })
        const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/bsc_testnet_chapel')
        provider
          .getTransaction(res.hash)
          .then((tx) => tx.wait(1))
          .then(() => {
            provider.getTransactionReceipt(res.hash).then((receipt) => {
              console.log({ receipt })
              txDispatch(TxEvent.PROCESSED, { txId, receipt })
              handleSubmit1(txId, receipt.transactionHash)
            })
          })
      })
    }
  }

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={handleSubmit} error={undefined} origin={origin} txId={txId}>
      <>
        <SendFromBlock />

        {safeTx && (
          <>
            <InfoDetails title={getInteractionTitle(safeTx.data.value || '', chain)}>
              <EthHashInfo address={safeTx.data.to} shortAddress={false} showCopyButton hasExplorer />
            </InfoDetails>

            <Box pb={2}>
              <Typography mt={2} color="primary.light" onClick={handleTest2}>
                Data (hex encoded)
              </Typography>
              {generateDataRowValue(safeTx.data.data, 'rawData')}
            </Box>

            {isMultiSend && (
              <Box mb={2} display="flex" flexDirection="column" gap={1}>
                <Multisend
                  txData={{
                    dataDecoded: decodedData,
                    to: { value: safeTx.data.to },
                    value: safeTx.data.value,
                    operation: safeTx.data.operation === OperationType.Call ? Operation.CALL : Operation.DELEGATE,
                    trustedDelegateCallTarget: false,
                  }}
                  variant="outlined"
                />
              </Box>
            )}
          </>
        )}
      </>
    </SignOrExecuteForm>
  )
}

export default ReviewSafeAppsTx
