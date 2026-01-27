import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Deposited,
  FlashLoanExecuted
} from "../generated/SimpleFlashloan/SimpleFlashloan"

export function createDepositedEvent(
  token: Address,
  amount: BigInt
): Deposited {
  let depositedEvent = changetype<Deposited>(newMockEvent())

  depositedEvent.parameters = new Array()

  depositedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  depositedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return depositedEvent
}

export function createFlashLoanExecutedEvent(
  asset: Address,
  amount: BigInt,
  premium: BigInt
): FlashLoanExecuted {
  let flashLoanExecutedEvent = changetype<FlashLoanExecuted>(newMockEvent())

  flashLoanExecutedEvent.parameters = new Array()

  flashLoanExecutedEvent.parameters.push(
    new ethereum.EventParam("asset", ethereum.Value.fromAddress(asset))
  )
  flashLoanExecutedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  flashLoanExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "premium",
      ethereum.Value.fromUnsignedBigInt(premium)
    )
  )

  return flashLoanExecutedEvent
}
