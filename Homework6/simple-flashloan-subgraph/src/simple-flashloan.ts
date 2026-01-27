import {
  Deposited as DepositedEvent,
  FlashLoanExecuted as FlashLoanExecutedEvent
} from "../generated/SimpleFlashloan/SimpleFlashloan"
import { Deposited, FlashLoanExecuted } from "../generated/schema"

export function handleDeposited(event: DepositedEvent): void {
  let entity = new Deposited(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFlashLoanExecuted(event: FlashLoanExecutedEvent): void {
  let entity = new FlashLoanExecuted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.asset = event.params.asset
  entity.amount = event.params.amount
  entity.premium = event.params.premium

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
